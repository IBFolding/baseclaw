from PIL import Image
import sys

# Load the logo
img = Image.open('logo.png')

# Convert to RGBA if not already
img = img.convert('RGBA')

# Create a new image with the background color (RGB, no alpha)
bg_color = (245, 240, 235)  # #F5F0EB
new_img = Image.new('RGB', img.size, bg_color)

# Paste the original image on top, using its alpha channel as mask
new_img.paste(img, (0, 0), img)

# Save as PNG (RGB, no transparency)
new_img.save('logo-filled.png')
print('Done - created logo-filled.png with background color #F5F0EB (RGB, no alpha)')