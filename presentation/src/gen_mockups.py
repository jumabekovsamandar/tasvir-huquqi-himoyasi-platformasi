"""Compose platform screenshots into premium browser-window mockups (transparent PNG w/ soft shadow)."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
SP=os.path.dirname(__file__)
SHOTS=os.path.join(SP,"shots"); OUT=os.path.join(SP,"assets"); os.makedirs(OUT,exist_ok=True)

FONT_PATH="/usr/share/fonts/truetype/custom/InterSemiBold-Regular.ttf"
FONT_MED="/usr/share/fonts/truetype/custom/InterMedium-Regular.ttf"

def rounded_mask(size, r):
    m=Image.new("L",size,0); d=ImageDraw.Draw(m)
    d.rounded_rectangle([0,0,size[0]-1,size[1]-1],radius=r,fill=255)
    return m

def mockup(shot, url, out, crop_h=None, bar=64, radius=22, pad=70, dark_bar=False):
    im=Image.open(os.path.join(SHOTS,shot)).convert("RGB")
    W,H=im.size
    scale=W/1440.0
    bar=int(bar*scale); radius=int(radius*scale)
    if crop_h:
        im=im.crop((0,0,W,min(H,int(crop_h*scale))))
        W,H=im.size
    # window = bar + screenshot
    win=Image.new("RGB",(W,H+bar),(255,255,255) if not dark_bar else (15,23,42))
    # top bar
    d=ImageDraw.Draw(win)
    barcol=(244,246,251) if not dark_bar else (17,25,46)
    d.rectangle([0,0,W,bar],fill=barcol)
    d.line([0,bar-1,W,bar-1],fill=(224,231,245) if not dark_bar else (34,44,79))
    # traffic dots
    cy=bar//2; r=int(7*scale)
    for i,c in enumerate([(255,95,86),(255,189,46),(39,201,63)]):
        cx=int((26+i*24)*scale)
        d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=c)
    # url pill
    pill_l=int(140*scale); pill_r=W-int(60*scale); ph=int(38*scale)
    py0=cy-ph//2
    d.rounded_rectangle([pill_l,py0,pill_r,py0+ph],radius=ph//2,
        fill=(255,255,255) if not dark_bar else (24,34,61),
        outline=(224,231,245) if not dark_bar else (40,52,90),width=max(1,int(scale)))
    try:
        f=ImageFont.truetype(FONT_MED,int(20*scale))
    except: f=ImageFont.load_default()
    # lock glyph
    lx=pill_l+int(22*scale)
    d.rounded_rectangle([lx,cy-int(6*scale),lx+int(11*scale),cy+int(5*scale)],radius=int(2*scale),
                        fill=(122,180,120))
    d.text((lx+int(26*scale),cy),url,font=f,fill=(90,110,150) if not dark_bar else (150,175,220),anchor="lm")
    # paste screenshot
    win.paste(im,(0,bar))
    # round the whole window
    fullW,fullH=W,H+bar
    mask=rounded_mask((fullW,fullH),radius)
    winr=Image.new("RGBA",(fullW,fullH),(0,0,0,0))
    winr.paste(win,(0,0),mask)
    # soft shadow on transparent canvas
    canvas=Image.new("RGBA",(fullW+pad*2,fullH+pad*2),(0,0,0,0))
    sh=Image.new("RGBA",canvas.size,(0,0,0,0))
    sd=ImageDraw.Draw(sh)
    sd.rounded_rectangle([pad,pad+int(10*scale),pad+fullW,pad+fullH+int(18*scale)],radius=radius,fill=(10,16,32,150))
    sh=sh.filter(ImageFilter.GaussianBlur(int(28*scale)))
    canvas=Image.alpha_composite(canvas,sh)
    canvas.paste(winr,(pad,pad),winr)
    canvas.save(os.path.join(OUT,out))
    print("saved",out,canvas.size)

mockup("dashboard.png","imagerights.uz/dashboard","mock_dashboard.png")
mockup("deepfake.png","imagerights.uz/dashboard/deepfake","mock_deepfake.png")
mockup("consent.png","imagerights.uz/dashboard/consent","mock_consent.png")
mockup("evidence.png","imagerights.uz/dashboard/evidence","mock_evidence.png")
mockup("monitoring.png","imagerights.uz/dashboard/monitoring","mock_monitoring.png")
mockup("registry.png","imagerights.uz/dashboard/registry","mock_registry.png")
mockup("legal.png","imagerights.uz/dashboard/legal-assistant","mock_legal.png")
mockup("marketplace.png","imagerights.uz/dashboard/marketplace","mock_marketplace.png")
