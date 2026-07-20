import re

html_file = 'index.html'

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_body(match):
    left_w = match.group(1)
    left_h = match.group(2)
    right_w = match.group(3)
    right_h = match.group(4)
    desc = match.group(5)
    file_name = match.group(6)

    return f'''<!-- CDit II Replica Body -->
                    <div class="cassette-body cdit-body">
                        <!-- Left exposed magnetic tape area -->
                        <div class="cdit-exposed-tape">
                            <div class="tape-shield"></div>
                            <div class="tape-hole hole-top"></div>
                            <div class="tape-hole hole-bottom"></div>
                        </div>
                        
                        <!-- Main CDit II Transparent Shell -->
                        <div class="cdit-shell">
                            <!-- Typography -->
                            <div class="cdit-brand-top">SONY</div>
                            <div class="cdit-brand-mid">CDit <span class="cdit-roman">II</span></div>
                            <div class="cdit-brand-vert">POSITION CHROME<br>IEC II / TYPE II ■ HIGH BIAS 70 µs EQ</div>
                            
                            <!-- Stickers -->
                            <div class="cdit-sticker side-b">
                                <span>side</span>
                                <strong>B</strong>
                            </div>
                            <div class="cdit-sticker length-90">
                                <strong>90</strong>
                            </div>
                            
                            <!-- The dark inner slip-sheet and window -->
                            <div class="cdit-inner-sheet">
                                <div class="cdit-window">
                                    <div class="cassette-spool top-spool">
                                        <div class="spool-teeth"></div>
                                        <div class="tape-reel" style="width: {left_w}px; height: {left_h}px;"></div>
                                    </div>
                                    <div class="cassette-spool bottom-spool">
                                        <div class="spool-teeth"></div>
                                        <div class="tape-reel" style="width: {right_w}px; height: {right_h}px;"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="cassette-info">
                                <p class="cassette-desc">{desc}</p>
                                <span class="cassette-file-name">{file_name}</span>
                            </div>
                        </div>
                    </div>'''

pattern = re.compile(
    r'<!-- Transparent Cassette Body -->\s*'
    r'<div class="cassette-body">\s*'
    r'<!-- Center Tape Window with Spools -->\s*'
    r'<div class="cassette-window">\s*'
    r'<div class="cassette-window-ruler"></div>\s*'
    r'<div class="cassette-spool left-spool">\s*'
    r'<div class="spool-teeth"></div>\s*'
    r'<div class="tape-reel" style="width: (\d+)px; height: (\d+)px;"></div>\s*'
    r'</div>\s*'
    r'<div class="cassette-spool right-spool">\s*'
    r'<div class="spool-teeth"></div>\s*'
    r'<div class="tape-reel" style="width: (\d+)px; height: (\d+)px;"></div>\s*'
    r'</div>\s*'
    r'</div>\s*'
    r'<div class="cassette-info">\s*'
    r'<p class="cassette-desc">([^<]+)</p>\s*'
    r'<span class="cassette-file-name">([^<]+)</span>\s*'
    r'</div>\s*'
    r'</div>'
)

print("Matches found:", len(pattern.findall(content)))
new_content = pattern.sub(replace_body, content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(new_content)
