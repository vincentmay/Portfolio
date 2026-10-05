"""Regenerate the social card from the rasterized brand asset (Python + Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / 'public'
fonts = Path('C:/Windows/Fonts')
sans = lambda size: ImageFont.truetype(str(fonts / 'segoeui.ttf'), size)
italic = lambda size: ImageFont.truetype(str(fonts / 'georgiai.ttf'), size)
paper, ink, accent = '#141416', '#f1efea', '#b9c9ff'
im = Image.new('RGB', (1200, 630), paper)
d = ImageDraw.Draw(im)
mark = Image.open(root / "stellar.webp").convert("RGBA")
mark.thumbnail((47, 47), Image.Resampling.LANCZOS)
im.paste(mark, (55, 35), mark)
d.text((115, 42), 'vincent.may', font=sans(29), fill=ink)
d.line((58, 99, 1142, 99), fill='#3b3a41')
d.text((58, 147), 'FULL-STACK DEVELOPER / ESSEN, GERMANY', font=sans(15), fill=accent)
d.text((50, 180), 'Vincent', font=sans(110), fill=ink)
d.text((50, 293), 'May.', font=sans(110), fill=ink)
d.text((58, 455), 'Curiosity, put to work.', font=sans(28), fill=accent)
star = Image.open(root / 'stellar.webp').convert('RGBA')
star.thumbnail((460, 460), Image.Resampling.LANCZOS)
im.paste(star, (680, 118), star)
d.line((58, 557, 1142, 557), fill='#3b3a41')
d.text((58, 578), 'GFOS Code  /  Blockwright  /  POVLINE', font=sans(17), fill=accent)
d.text((982, 578), 'vincentmay.com', font=sans(17), fill=ink)
im.save(root / 'og.png', optimize=True)
print('Generated og.png using the shared stellar asset')
