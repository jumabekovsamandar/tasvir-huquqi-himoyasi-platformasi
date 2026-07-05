"""Bake premium full-bleed slide backgrounds (1920x1080)."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os, math
OUT=os.path.join(os.path.dirname(__file__),"assets"); os.makedirs(OUT,exist_ok=True)
W,H=1920,1080

def vgrad(c0,c1):
    a=np.zeros((H,W,3),np.uint8)
    for y in range(H):
        t=y/(H-1)
        a[y,:]= [int(c0[i]+(c1[i]-c0[i])*t) for i in range(3)]
    return Image.fromarray(a,"RGB")

def radial_glow(cx,cy,rad,color,strength):
    yy,xx=np.mgrid[0:H,0:W]
    d=np.sqrt((xx-cx)**2+(yy-cy)**2)/rad
    m=np.clip(1-d,0,1)**2.2
    g=np.zeros((H,W,4),np.uint8)
    for i in range(3): g[:,:,i]=color[i]
    g[:,:,3]=(m*strength).astype(np.uint8)
    return Image.fromarray(g,"RGBA")

def dot_grid(color,alpha,step=44,r=1):
    g=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(g)
    for y in range(step,H,step):
        for x in range(step,W,step):
            d.ellipse([x-r,y-r,x+r,y+r],fill=color+(alpha,))
    return g

def line_grid(color,alpha,step=60):
    g=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(g)
    for x in range(0,W,step): d.line([x,0,x,H],fill=color+(alpha,))
    for y in range(0,H,step): d.line([0,y,W,y],fill=color+(alpha,))
    return g

def compose_dark(name, glow_pos):
    base=vgrad((10,16,32),(15,24,44)).convert("RGBA")
    base=Image.alpha_composite(base, dot_grid((90,120,190),16,step=46,r=1))
    glows={"R":(1500,150,900,150),"L":(300,950,950,120),"C":(960,470,1050,150),
           "TR":(1650,80,760,175)}
    cx,cy,rad,st=glows[glow_pos]
    base=Image.alpha_composite(base, radial_glow(cx,cy,rad,(51,102,255),st))
    if glow_pos in ("C","TR"):
        base=Image.alpha_composite(base, radial_glow(cx-500,cy+400,700,(60,150,255),60))
    base.convert("RGB").save(os.path.join(OUT,f"bg_dark_{name}.png"),quality=95)
    print("saved bg_dark_"+name)

def compose_light(name="main"):
    base=vgrad((248,250,253),(238,242,249).__class__((238,242,249))).convert("RGBA") if False else vgrad((249,251,254),(237,241,249)).convert("RGBA")
    base=Image.alpha_composite(base, line_grid((15,23,42),7,step=64))
    base=Image.alpha_composite(base, radial_glow(1620,120,720,(51,102,255),34))
    base=Image.alpha_composite(base, radial_glow(180,980,640,(80,140,255),22))
    base.convert("RGB").save(os.path.join(OUT,f"bg_light_{name}.png"),quality=95)
    print("saved bg_light_"+name)

compose_dark("R","TR")
compose_dark("L","L")
compose_dark("C","C")
compose_light("main")
