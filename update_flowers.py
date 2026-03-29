import re

with open("index.html", "r") as f:
    html = f.read()

# Pattern to find the existing flower garden block
garden_pattern = r"(<div class=\"flower-garden-background\">.*?</style>)"
match = re.search(garden_pattern, html, re.DOTALL)

if match:
    # Build new HTML
    style = """<style>
    /* Organic SVG Garden Container */
    .flower-garden-background {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        pointer-events: none;
        overflow: hidden;
    }

    .svg-flower-wrapper {
        position: absolute;
        bottom: 0;
        transform-origin: bottom center;
        transform: scale(var(--scale));
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 10px; /* small base width for absolute alignment */
    }

    .svg-stem {
        width: 6px;
        height: var(--stem-h, 40vh);
        background-color: #243B35;
        border-radius: 4px 4px 0 0;
        transform-origin: bottom center;
        animation: stem-grow 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        animation-delay: var(--delay);
        transform: scaleY(0);
    }

    .svg-leaf {
        position: absolute;
        width: 60px;
        height: 60px;
        bottom: calc(var(--stem-h, 40vh) * 0.4);
        opacity: 0;
        animation: leaf-bloom 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        animation-delay: calc(var(--delay) + 0.6s);
        filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.15));
    }

    .leaf-left {
        right: 2px;
        transform-origin: bottom right;
    }

    .leaf-right {
        left: 2px;
        transform-origin: bottom left;
    }

    .svg-flower-head {
        position: absolute;
        bottom: calc(var(--stem-h, 40vh) - 30px);
        left: -55px;
        width: 120px;
        height: 120px;
        opacity: 0;
        transform-origin: center;
        animation: flower-bloom 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        animation-delay: calc(var(--delay) + 1.0s);
        filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.15));
    }

    @keyframes stem-grow {
        0% { transform: scaleY(0); }
        100% { transform: scaleY(1); }
    }

    @keyframes leaf-bloom {
        0% { transform: scale(0) rotate(var(--rot, 0deg)); opacity: 0; }
        100% { transform: scale(1) rotate(var(--rot, 0deg)); opacity: 1; }
    }

    @keyframes flower-bloom {
        0% { transform: scale(0) rotate(-15deg); opacity: 0; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    </style>"""

    def type1(color):
        return f"""
            <svg class="svg-flower-head" viewBox="0 0 100 100">
                <path d="M 50 50 C 20 60, 5 10, 50 5 C 95 10, 80 60, 50 50 Z" fill="{color}"/>
                <path d="M 50 50 C 20 60, 5 10, 50 5 C 95 10, 80 60, 50 50 Z" fill="{color}" transform="rotate(72 50 50)"/>
                <path d="M 50 50 C 20 60, 5 10, 50 5 C 95 10, 80 60, 50 50 Z" fill="{color}" transform="rotate(144 50 50)"/>
                <path d="M 50 50 C 20 60, 5 10, 50 5 C 95 10, 80 60, 50 50 Z" fill="{color}" transform="rotate(216 50 50)"/>
                <path d="M 50 50 C 20 60, 5 10, 50 5 C 95 10, 80 60, 50 50 Z" fill="{color}" transform="rotate(288 50 50)"/>
                <circle cx="50" cy="50" r="14" fill="#CBA135" />
            </svg>
"""

    def type2(color):
        return f"""
            <svg class="svg-flower-head" viewBox="0 0 100 100">
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(45 50 50)"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(90 50 50)"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(135 50 50)"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(180 50 50)"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(225 50 50)"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(270 50 50)"/>
                <path d="M 50 50 C 35 40, 35 15, 50 5 C 65 15, 65 40, 50 50 Z" fill="{color}" transform="rotate(315 50 50)"/>
                <circle cx="50" cy="50" r="12" fill="#243B35" />
                <circle cx="50" cy="50" r="8" fill="#CBA135" />
            </svg>
"""

    flowers = ""
    configs = [
        (8, 0.2, 0.85, 45, "#E25C2B", 1),
        (18, 0.6, 0.65, 30, "#F0A500", 2),
        (30, 0.1, 0.95, 50, "#A86573", 1),
        (42, 1.2, 0.70, 35, "#E25C2B", 2),
        (55, 0.8, 0.80, 42, "#F0A500", 1),
        (68, 1.5, 0.55, 25, "#A86573", 2),
        (82, 0.4, 0.90, 48, "#E25C2B", 1),
        (92, 1.0, 0.60, 35, "#F0A500", 2),
        (25, 1.8, 0.50, 20, "#A86573", 1),
        (75, 2.1, 0.75, 38, "#E25C2B", 2)
    ]
    
    for c in configs:
        left, delay, scale, stemh, color, t = c
        head = type1(color) if t == 1 else type2(color)
        flowers += f"""
        <div class="svg-flower-wrapper" style="left: {left}vw; --delay: {delay}s; --scale: {scale}; --stem-h: {stemh}vh;">
            <div class="svg-stem"></div>
            <svg class="svg-leaf leaf-left" viewBox="0 0 100 100" style="--rot: -15deg;"><path d="M 100 100 C 50 80, 20 40, 0 0 C 40 10, 80 40, 100 100 Z" fill="#243B35" /></svg>
            <svg class="svg-leaf leaf-right" viewBox="0 0 100 100" style="--rot: 15deg;"><path d="M 0 100 C 50 80, 80 40, 100 0 C 60 10, 20 40, 0 100 Z" fill="#243B35" /></svg>
            {head}
        </div>"""

    new_garden = f'<div class="flower-garden-background">\n{flowers}\n    </div>\n\n    {style}'
    
    html = html.replace(match.group(1), new_garden)
    
    with open("index.html", "w") as f:
        f.write(html)
    print("Success")
else:
    print("Regex match failed")
