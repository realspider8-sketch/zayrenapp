import os

def check_and_convert(file_path):
    if not os.path.isfile(file_path):
        return
    with open(file_path, 'rb') as f:
        raw = f.read()
    
    modified = False
    text = ""
    if raw.startswith(b'\xff\xfe'):
        print(f"Converting {file_path} from UTF-16 LE to UTF-8 without BOM")
        text = raw[2:].decode('utf-16-le')
        modified = True
    elif raw.startswith(b'\xfe\xff'):
        print(f"Converting {file_path} from UTF-16 BE to UTF-8 without BOM")
        text = raw[2:].decode('utf-16-be')
        modified = True
    elif raw.startswith(b'\xef\xbb\xbf'):
        print(f"Removing BOM from {file_path} (UTF-8 with BOM)")
        text = raw[3:].decode('utf-8')
        modified = True
    elif b'\x00' in raw:
        # potentially UTF-16 without BOM, but let's be careful
        pass
        
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)

files_to_check = [
    '.gitignore',
    'wrangler.json',
    'wrangler.toml',
    'package.json',
    'tsconfig.json'
]

for root, dirs, files in os.walk('.'):
    # skip node_modules, .git, .venv, etc.
    if '.git' in dirs:
        dirs.remove('.git')
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.venv' in dirs:
        dirs.remove('.venv')
    if '.expo' in dirs:
        dirs.remove('.expo')
        
    for file in files:
        if file.endswith(('.json', '.toml', '.ts', '.tsx', '.js', '.jsx')) or file.startswith('.gitignore') or file.startswith('vite.config'):
            file_path = os.path.join(root, file)
            check_and_convert(file_path)

print("Done checking files.")
