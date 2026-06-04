from PIL import Image, ImageFilter
import numpy as np
from collections import deque

# Load the image
img = Image.open('logo.png')
img = img.convert('RGBA')

# Get image dimensions
width, height = img.size

# Convert to numpy array for processing
arr = np.array(img)

# Get edge pixels to determine background color
edges = np.concatenate([
    arr[0,:],      # top
    arr[-1,:],     # bottom
    arr[:,0],      # left
    arr[:,-1]      # right
])

# Find most common edge color (the background)
unique, counts = np.unique(edges.reshape(-1, edges.shape[-1]), axis=0, return_counts=True)
bg_color = unique[np.argmax(counts)]
print(f"Background color: RGB{tuple(bg_color[:3])}")

# Create a mask for background pixels
r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

bg_r, bg_g, bg_b = bg_color[:3]

# Use a wider threshold to catch the light gray border too
threshold = 30
is_bg = (np.abs(r - bg_r) < threshold) & \
        (np.abs(g - bg_g) < threshold) & \
        (np.abs(b - bg_b) < threshold)

# Also catch slightly darker gray border pixels
is_gray_border = (r > 180) & (g > 180) & (b > 180) & (np.abs(r - g) < 30) & (np.abs(g - b) < 30)

# Combine
is_bg = is_bg | is_gray_border

# Create visited array
visited = np.zeros((height, width), dtype=bool)

# Find all edge pixels that are background
edge_pixels = []
for x in range(width):
    if is_bg[0, x]:
        edge_pixels.append((x, 0))
    if is_bg[height-1, x]:
        edge_pixels.append((x, height-1))

for y in range(height):
    if is_bg[y, 0]:
        edge_pixels.append((0, y))
    if is_bg[y, width-1]:
        edge_pixels.append((width-1, y))

print(f"Edge background pixels found: {len(edge_pixels)}")

# BFS to find all connected background pixels from edges
queue = deque(edge_pixels)
for px, py in edge_pixels:
    visited[py, px] = True

# Directions for 8-connectivity
directions = [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]

while queue:
    x, y = queue.popleft()
    
    for dx, dy in directions:
        nx, ny = x + dx, y + dy
        
        if 0 <= nx < width and 0 <= ny < height:
            if not visited[ny, nx] and is_bg[ny, nx]:
                visited[ny, nx] = True
                queue.append((nx, ny))

print(f"Total connected background pixels: {np.sum(visited)}")

# Create output array
output = arr.copy()

# Set alpha to 0 for visited (connected background) pixels
output[visited, 3] = 0

# Convert back to PIL Image
result = Image.fromarray(output)

# Feather/soften the alpha edge
alpha_mask = result.split()[3]

# Apply Gaussian blur for smooth edges
alpha_blurred = alpha_mask.filter(ImageFilter.GaussianBlur(radius=2))

# Put the blurred alpha back
result.putalpha(alpha_blurred)

# Save the result
result.save('agent-blue-logo-transparent.png')

print(f"Saved agent-blue-logo-transparent.png")
print(f"Image size: {result.size}")
print(f"Mode: {result.mode}")

# Verify transparency
arr_check = np.array(result)
transparent_pixels = np.sum(arr_check[:,:,3] < 10)
total_pixels = arr_check.shape[0] * arr_check.shape[1]
print(f"Transparent pixels: {transparent_pixels} / {total_pixels} ({100*transparent_pixels/total_pixels:.1f}%)")
