#!/usr/bin/env python
"""
split_bio_gui.py

Drag-and-drop / GUI helper for splitting a single big bio .txt file into
separate section files based on headers:

[NAME]
[TITLE]
[BIO]
[ABILITY]
[STATS]
[DESC]

For each input file, this script creates subfolders next to it:

  NAME/<file>.txt
  TITLE/<file>.txt
  BIO/<file>.txt
  ABILITY/<file>.txt
  STATS/<file>.txt
  DESC/<file>.txt

Usage on Windows:
- Option 1 (GUI): Double-click this script. A small window opens.
  * Drag & drop .txt files onto the big box, OR click "Add Files".
  * Then click "Process Files".

- Option 2 (no GUI): Drag & drop .txt files onto the script icon in Explorer.
  The script will process them and exit.
"""

import sys
from pathlib import Path

import tkinter as tk
from tkinter import filedialog, messagebox

# Optional drag-and-drop support via tkinterdnd2.
# If you install it with:
#   pip install tkinterdnd2
# you'll be able to drop files directly onto the window.
try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    DND_AVAILABLE = True
except Exception:
    DND_AVAILABLE = False


SECTIONS = ["NAME", "TITLE", "BIO", "ABILITY", "STATS", "DESC"]


def parse_sections(text: str) -> dict:
    """
    Parse a single source text into sections keyed by
    NAME, TITLE, BIO, ABILITY, STATS, DESC.
    """
    lines = text.splitlines()
    sections = {key: [] for key in SECTIONS}
    current = None

    for line in lines:
        stripped = line.strip()

        # Check for a header like [NAME]
        if stripped.startswith("[") and stripped.endswith("]"):
            key = stripped[1:-1].strip().upper()
            if key in sections:
                current = key
            else:
                current = None
            continue

        # If we're inside a known section, record the line
        if current is not None:
            sections[current].append(line)

    # Join and strip trailing whitespace/newlines
    return {
        key: "\n".join(lines).rstrip()
        for key, lines in sections.items()
        if lines  # only keep sections that actually had content
    }


def process_file(path: Path) -> int:
    """
    Process a single .txt file. Returns the number of sections written.
    """
    if not path.is_file():
        print(f"Skipping (not a file): {path}")
        return 0

    print(f"\nProcessing: {path}")
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"  ERROR reading file: {e}")
        return 0

    sections = parse_sections(text)

    if not sections:
        print("  No [NAME]/[BIO]/etc. sections found, skipping.")
        return 0

    parent = path.parent
    base_name = path.stem  # filename without extension
    count = 0

    for key, content in sections.items():
        out_dir = parent / key  # e.g. .../NAME, .../BIO
        out_dir.mkdir(exist_ok=True)

        out_file = out_dir / f"{base_name}.txt"
        try:
            out_file.write_text(content + "\n", encoding="utf-8")
            print(f"  -> Wrote {out_file}")
            count += 1
        except Exception as e:
            print(f"  ERROR writing {out_file}: {e}")

    return count


def cli_mode(file_args):
    """
    Simple command-line mode when files are drag-dropped onto the script icon.
    """
    total_sections = 0
    for arg in file_args:
        p = Path(arg)
        total_sections += process_file(p)

    print(f"\nDone. Wrote {total_sections} section files in total.")
    input("Press Enter to exit...")


class SplitBioApp(TkinterDnD.Tk if DND_AVAILABLE else tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Split Bio Sections")
        self.geometry("620x360")
        self.configure(bg="#202020")

        self.selected_files = []

        # Main frame
        frame = tk.Frame(self, bg="#202020")
        frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Info label
        info = tk.Label(
            frame,
            text=(
                "Drag & drop .txt files here\n"
                "containing [NAME] [TITLE] [BIO] [ABILITY] [STATS] [DESC]\n"
                "or click 'Add Files' below."
            ),
            fg="#f0f0f0",
            bg="#202020",
            font=("Segoe UI", 11),
            justify="center",
        )
        info.pack(pady=(0, 10))

        # Drop area
        self.drop_box = tk.Listbox(
            frame,
            selectmode="extended",
            bg="#181818",
            fg="#f8f8f8",
            relief="solid",
            borderwidth=1,
            highlightthickness=0,
            font=("Consolas", 10),
        )
        self.drop_box.pack(fill="both", expand=True)

        if DND_AVAILABLE:
            self.drop_box.insert(tk.END, "Drop .txt files here...")
            self.drop_box.drop_target_register(DND_FILES)
            self.drop_box.dnd_bind("<<Drop>>", self._on_drop)
        else:
            self.drop_box.insert(
                tk.END,
                "Drag-and-drop inside the window requires 'tkinterdnd2'.\n"
                "You can still click 'Add Files' below."
            )

        # Buttons
        btn_frame = tk.Frame(frame, bg="#202020")
        btn_frame.pack(fill="x", pady=(10, 0))

        add_btn = tk.Button(
            btn_frame, text="Add Files...", command=self._on_add_files
        )
        add_btn.pack(side="left", padx=(0, 6))

        clear_btn = tk.Button(
            btn_frame, text="Clear List", command=self._on_clear
        )
        clear_btn.pack(side="left", padx=(0, 6))

        process_btn = tk.Button(
            btn_frame, text="Process Files", command=self._on_process
        )
        process_btn.pack(side="right")

    def _on_add_files(self):
        paths = filedialog.askopenfilenames(
            title="Select .txt files",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
        )
        if not paths:
            return
        self._add_paths(paths)

    def _on_clear(self):
        self.selected_files = []
        self.drop_box.delete(0, tk.END)
        if DND_AVAILABLE:
            self.drop_box.insert(tk.END, "Drop .txt files here...")
        else:
            self.drop_box.insert(
                tk.END,
                "Drag-and-drop inside the window requires 'tkinterdnd2'.\n"
                "You can still click 'Add Files' below."
            )

    def _add_paths(self, paths):
        # Remove placeholder text if present
        if self.drop_box.size() == 1:
            first = self.drop_box.get(0)
            if "Drop .txt files here" in first or "tkinterdnd2" in first:
                self.drop_box.delete(0, tk.END)

        for p in paths:
            p = Path(p)
            if p.is_file() and p.suffix.lower() == ".txt":
                if str(p) not in self.selected_files:
                    self.selected_files.append(str(p))
                    self.drop_box.insert(tk.END, str(p))

    def _on_drop(self, event):
        # event.data may contain one or more filenames wrapped in { } if spaces
        raw = event.data
        if not raw:
            return

        paths = []
        current = ""
        inside_brace = False
        for ch in raw:
            if ch == "{":
                inside_brace = True
                current = ""
            elif ch == "}":
                inside_brace = False
                paths.append(current)
                current = ""
            elif ch == " " and not inside_brace:
                if current:
                    paths.append(current)
                    current = ""
            else:
                current += ch
        if current:
            paths.append(current)

        self._add_paths(paths)

    def _on_process(self):
        if not self.selected_files:
            messagebox.showinfo("No files", "Please add at least one .txt file first.")
            return

        total_files = 0
        total_sections = 0
        for p_str in self.selected_files:
            p = Path(p_str)
            if not p.is_file():
                continue
            total_files += 1
            total_sections += process_file(p)

        messagebox.showinfo(
            "Done",
            f"Processed {total_files} file(s).\n"
            f"Wrote {total_sections} section file(s) total.\n\n"
            "Each file's sections are in NAME/, TITLE/, BIO/, ABILITY/, STATS/, DESC/ folders\n"
            "next to the original .txt file."
        )


def main():
    # If user drag-dropped onto the script icon (argv has files),
    # use CLI mode and exit.
    if len(sys.argv) > 1:
        cli_mode(sys.argv[1:])
        return

    # Otherwise, launch GUI.
    app = SplitBioApp()
    app.mainloop()


if __name__ == "__main__":
    main()
