# Current-edition source and import provenance

These are required maintenance inputs, despite the historical directory name:

- `shifa_raw.txt`: untouched original transcription. Integrity tests pin its hash; do not download over it or normalize it.
- `test_full_generation.py`: original chapter boundaries and parsing rules. The JavaScript integrity audit reads it to independently replay the import.
- `generate_dataset_files.py`: historical dataset generator using that parser. It writes application data; do not run it during routine maintenance.
- `verify_dataset.py`: standalone checks of the original parser output.

One-off inspection scripts, downloads, screenshots and research records were removed after checking their existing external recovery copies. They are not dependencies. Retained source evidence and active correction records are in `reports/al-shifa-integrity/`.
