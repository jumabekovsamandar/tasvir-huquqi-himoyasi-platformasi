"""Generate premium facial-recognition mesh assets for the ImageRights.uz deck."""
import numpy as np
from scipy.spatial import Delaunay
from PIL import Image, ImageDraw, ImageFilter
import math, os

OUT = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(OUT, exist_ok=True)

# ---------- palette ----------
BLUE   = (89, 141, 255)     # brand-400 electric
BLUE_HI= (150, 190, 255)
BLUE_LO= (46, 74, 140)
CYAN   = (120, 210, 255)
NAVY   = (11, 18, 35)
NODE   = (190, 214, 255)

def _egg(cx, cy, rx, ry, n, chin=1.18):
    """egg-shaped face oval, narrower + longer at chin."""
    pts=[]
    for i in range(n):
        a = -math.pi/2 + 2*math.pi*i/n
        x = cx + rx*math.cos(a)
        yy = math.sin(a)
        # elongate lower half (chin)
        y = cy + ry*yy*(chin if yy>0 else 0.92)
        # taper width toward chin
        if yy>0:
            x = cx + (x-cx)*(1-0.28*yy)
        pts.append((x,y))
    return pts

def face_landmarks():
    pts=[]
    feat=[]  # index list of "feature" (brighter) nodes
    cx,cy=0.5,0.47
    # oval
    oval=_egg(cx,cy,0.255,0.34,30)
    pts += oval
    # eyes
    for ex in (0.385, 0.615):
        ec=(ex,0.45)
        for i in range(10):
            a=2*math.pi*i/10
            pts.append((ec[0]+0.072*math.cos(a), ec[1]+0.036*math.sin(a)))
        pts.append(ec); feat.append(len(pts)-1)  # pupil
    # eyebrows
    for sgn,(bx) in ((-1,0.385),(1,0.615)):
        for i in range(6):
            t=i/5.0
            x=bx-0.10+0.20*t
            y=0.375 - 0.045*math.sin(math.pi*t)
            pts.append((x,y))
    # nose bridge + tip + nostrils
    for i in range(4):
        pts.append((0.5, 0.45+0.055*i))
    pts.append((0.5,0.60)); feat.append(len(pts)-1)  # tip
    for dx in (-0.055,-0.028,0.028,0.055):
        pts.append((0.5+dx,0.615))
    # mouth outer
    for i in range(12):
        a=math.pi*i/11
        pts.append((0.5-0.088+0.176*i/11, 0.685+0.03*math.sin(a)))
    for i in range(8):
        a=math.pi*i/7
        pts.append((0.5-0.07+0.14*i/7, 0.685-0.018*math.sin(a)))
    # cheek / forehead / jaw filler for denser mesh
    rng=np.random.default_rng(7)
    filler=[]
    while len(filler)<46:
        x=rng.uniform(0.26,0.74); y=rng.uniform(0.16,0.80)
        # inside egg test (approx ellipse)
        nx=(x-cx)/0.255; ny=(y-cy)/0.34
        if nx*nx+ny*ny<0.92:
            filler.append((x,y))
    pts+=filler
    return np.array(pts), feat

def render_mesh(W, H, glitch=False, seed=1):
    """Return an RGBA image (transparent) of the face mesh sized WxH."""
    SS=2
    w,h=W*SS,H*SS
    img=Image.new("RGBA",(w,h),(0,0,0,0))
    glow=Image.new("RGBA",(w,h),(0,0,0,0))
    d=ImageDraw.Draw(img); dg=ImageDraw.Draw(glow)
    P,feat=face_landmarks()
    # map normalized -> pixel with margin
    mx,my=0.14,0.10
    X=(mx+P[:,0]*(1-2*mx))*w
    Y=(my+P[:,1]*(1-2*my))*h
    XY=np.column_stack([X,Y])
    tri=Delaunay(P)
    cx,cy=0.5,0.47
    rng=np.random.default_rng(seed)
    for s in tri.simplices:
        c=P[s].mean(axis=0)
        nx=(c[0]-cx)/0.255; ny=(c[1]-cy)/0.34
        if nx*nx+ny*ny>1.02:  # drop triangles outside face
            continue
        poly=[(XY[i,0],XY[i,1]) for i in s]
        gl = glitch and c[0]>0.5   # right half glitched
        if gl:
            # controlled displacement + red/magenta channel split
            off=rng.uniform(-9,9,2)*SS
            poly=[(px+off[0],py+off[1]) for px,py in poly]
            col=(255,90,120,110) if rng.random()>0.5 else (130,140,255,100)
            d.line(poly+[poly[0]],fill=col,width=SS)
        else:
            shade=0.55+0.45*rng.random()
            col=(int(BLUE[0]*shade),int(BLUE[1]*shade),int(BLUE[2]*shade),128)
            d.line(poly+[poly[0]],fill=col,width=SS)
    # nodes
    for i,(px,py) in enumerate(XY):
        c=P[i]
        gl = glitch and c[0]>0.5
        r = (4.6 if i in feat else 2.6)*SS
        if gl:
            dg.ellipse([px-r*2,py-r*2,px+r*2,py+r*2],fill=(255,90,120,70))
            d.ellipse([px-r,py-r,px+r,py+r],fill=(255,150,170,230))
        else:
            col = BLUE_HI if i in feat else NODE
            dg.ellipse([px-r*2.4,py-r*2.4,px+r*2.4,py+r*2.4],fill=col+(60,))
            d.ellipse([px-r,py-r,px+r,py+r],fill=col+(255,))
    glow=glow.filter(ImageFilter.GaussianBlur(9*SS))
    out=Image.alpha_composite(glow,img)
    out=out.resize((W,H),Image.LANCZOS)
    return out

def add_frame(img, label_left="FACE-ID", conf="MATCH 0.98"):
    """add a crop bounding frame with corner brackets + scan line + HUD labels."""
    W,H=img.size
    SS=2
    ov=Image.new("RGBA",(W*SS,H*SS),(0,0,0,0)); d=ImageDraw.Draw(ov)
    # bounding box around face region
    bx0,by0,bx1,by1=int(0.20*W*SS),int(0.10*H*SS),int(0.80*W*SS),int(0.92*H*SS)
    br=(CYAN)
    L=int(0.05*W*SS); t=3*SS
    for (cxp,cyp,dx,dy) in [(bx0,by0,1,1),(bx1,by0,-1,1),(bx0,by1,1,-1),(bx1,by1,-1,-1)]:
        d.line([(cxp,cyp),(cxp+dx*L,cyp)],fill=br+(230,),width=t)
        d.line([(cxp,cyp),(cxp,cyp+dy*L)],fill=br+(230,),width=t)
    # scan line
    sy=int(0.40*H*SS)
    d.line([(bx0,sy),(bx1,sy)],fill=CYAN+(150,),width=2*SS)
    ov=ov.resize((W,H),Image.LANCZOS)
    return Image.alpha_composite(img,ov)

# ---- Cover hero ----
hero=render_mesh(1500,1750)
hero=add_frame(hero)
hero.save(os.path.join(OUT,"facemesh_hero.png"))
print("saved facemesh_hero.png", hero.size)

# ---- Deepfake morph (authentic -> manipulated) ----
df=render_mesh(1700,1500,glitch=True,seed=3)
df.save(os.path.join(OUT,"facemesh_deepfake.png"))
print("saved facemesh_deepfake.png", df.size)

# ---- small consent/identity mesh (compact, for accents) ----
mini=render_mesh(900,1050)
mini.save(os.path.join(OUT,"facemesh_mini.png"))
print("saved facemesh_mini.png", mini.size)
