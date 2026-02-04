"""
Generate particle texture maps from Dala logo image.
Creates: position, scale, and color textures for the WebGL particle system.
"""

import numpy as np
from PIL import Image
import struct
import os

def generate_particle_textures(logo_path, output_dir, texture_size=200):
    """
    Generate particle textures from a logo image.
    
    The particle system expects:
    - pos-33.exr: Position data (x,y,z for each particle)
    - sc-33.png: Scale data (brightness = particle size)
    - cd-33.png: Color data (RGB for each particle)
    """
    
    # Load the logo image
    logo = Image.open(logo_path).convert('RGBA')
    logo = logo.resize((texture_size, texture_size), Image.Resampling.LANCZOS)
    logo_array = np.array(logo)
    
    # Extract RGB and alpha
    rgb = logo_array[:, :, :3]
    alpha = logo_array[:, :, 3]
    
    # Create a mask for where particles should exist
    # Particles where there's color (not white/transparent background)
    gray = np.mean(rgb, axis=2)
    
    # For the logo: particles where it's NOT white background
    # White pixels have high values in all channels
    is_not_white = np.any(rgb < 240, axis=2)
    is_not_transparent = alpha > 128
    particle_mask = is_not_white & is_not_transparent
    
    # Get particle positions (normalized 0-1)
    particle_positions = []
    particle_colors = []
    particle_scales = []
    
    for y in range(texture_size):
        for x in range(texture_size):
            if particle_mask[y, x]:
                # Normalize positions to 0-1 range
                pos_x = x / texture_size
                pos_y = 1.0 - (y / texture_size)  # Flip Y
                pos_z = 0.5 + (gray[y, x] / 255.0) * 0.2  # Slight depth based on brightness
                
                particle_positions.append((pos_x, pos_y, pos_z))
                particle_colors.append(tuple(rgb[y, x]))
                
                # Scale based on local darkness (darker = bigger particle)
                scale = 1.0 - (gray[y, x] / 255.0) * 0.5
                particle_scales.append(scale)
    
    num_particles = len(particle_positions)
    print(f"Generated {num_particles} particles from logo")
    
    # Determine output texture dimensions (square, power of 2)
    tex_dim = int(np.ceil(np.sqrt(num_particles)))
    tex_dim = max(tex_dim, 100)  # Minimum 100x100
    
    print(f"Output texture size: {tex_dim}x{tex_dim}")
    
    # Create color texture (cd-33.png)
    color_data = np.zeros((tex_dim, tex_dim, 3), dtype=np.uint8)
    for i, color in enumerate(particle_colors):
        y = i // tex_dim
        x = i % tex_dim
        if y < tex_dim:
            color_data[y, x] = color
    
    # Fill remaining with purple (brand color)
    for i in range(num_particles, tex_dim * tex_dim):
        y = i // tex_dim
        x = i % tex_dim
        color_data[y, x] = [146, 106, 255]  # Purple
    
    color_img = Image.fromarray(color_data, 'RGB')
    color_path = os.path.join(output_dir, 'cd-33-logo.png')
    color_img.save(color_path)
    print(f"Saved color texture: {color_path}")
    
    # Create scale texture (sc-33.png)
    scale_data = np.zeros((tex_dim, tex_dim), dtype=np.uint8)
    for i, scale in enumerate(particle_scales):
        y = i // tex_dim
        x = i % tex_dim
        if y < tex_dim:
            scale_data[y, x] = int(scale * 255)
    
    # Fill remaining with medium scale
    for i in range(num_particles, tex_dim * tex_dim):
        y = i // tex_dim
        x = i % tex_dim
        scale_data[y, x] = 128
    
    scale_img = Image.fromarray(scale_data, 'L')
    scale_path = os.path.join(output_dir, 'sc-33-logo.png')
    scale_img.save(scale_path)
    print(f"Saved scale texture: {scale_path}")
    
    # Create position texture (simplified PNG version - not EXR)
    # Store positions as RGB where R=X, G=Y, B=Z (all normalized 0-255)
    pos_data = np.zeros((tex_dim, tex_dim, 3), dtype=np.uint8)
    for i, pos in enumerate(particle_positions):
        y = i // tex_dim
        x = i % tex_dim
        if y < tex_dim:
            pos_data[y, x] = [
                int(pos[0] * 255),  # X
                int(pos[1] * 255),  # Y
                int(pos[2] * 255)   # Z
            ]
    
    # Fill remaining with center positions
    for i in range(num_particles, tex_dim * tex_dim):
        y = i // tex_dim
        x = i % tex_dim
        pos_data[y, x] = [128, 128, 128]
    
    pos_img = Image.fromarray(pos_data, 'RGB')
    pos_path = os.path.join(output_dir, 'pos-33-logo.png')
    pos_img.save(pos_path)
    print(f"Saved position texture: {pos_path}")
    
    return num_particles, tex_dim

if __name__ == "__main__":
    logo_path = r"WhatsApp Image 2026-01-12 at 9.39.52 AM.jpeg"
    output_dir = r"assets\images"
    
    if os.path.exists(logo_path):
        generate_particle_textures(logo_path, output_dir)
        print("\nTextures generated successfully!")
        print("Files created:")
        print("  - assets/images/cd-33-logo.png (color)")
        print("  - assets/images/sc-33-logo.png (scale)")
        print("  - assets/images/pos-33-logo.png (position)")
    else:
        print(f"Error: Logo file not found: {logo_path}")
