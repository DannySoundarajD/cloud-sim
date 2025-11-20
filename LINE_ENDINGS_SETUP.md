# Line Endings Configuration

This document confirms that the CloudSim repository is configured to use **LF (Line Feed)** line endings for all text files.

## Configuration Status

### Git Configuration
- `core.autocrlf = false` - Prevents automatic CRLF conversion
- `core.eol = lf` - Sets LF as the default line ending

### .gitattributes
The repository includes a comprehensive `.gitattributes` file that:
- Sets `* text=auto eol=lf` as the default for all text files
- Explicitly declares LF endings for common file types:
  - Source code: `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`
  - Configuration: `.json`, `.yml`, `.yaml`, `.config`, `.conf`
  - Documentation: `.md`, `.txt`
  - Scripts: `.sh`, `.bat`, `.ps1`
  - And many more...

## Normalization

All files in the repository have been normalized to use LF line endings using:
```bash
git add --renormalize .
```

This ensures that:
1. All existing files use LF endings
2. All new files will automatically use LF endings
3. Files are normalized on commit according to `.gitattributes`

## Verification

To verify line endings are correct:
```bash
# Check Git configuration
git config --get core.autocrlf
git config --get core.eol

# Verify .gitattributes is in place
cat .gitattributes
```

## Benefits

- **Cross-platform compatibility**: Works consistently on Windows, macOS, and Linux
- **Consistent diffs**: Prevents unnecessary line ending changes in Git diffs
- **Team collaboration**: All team members will have the same line endings regardless of OS
- **CI/CD compatibility**: Build systems expect LF endings

## Maintenance

No further action needed. The `.gitattributes` file ensures all future commits will use LF endings automatically.
