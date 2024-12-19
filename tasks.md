# Tasks

## Harith Ibraim
- Implement file upload functionality.
- Develop a PDF viewer.
- Update schema for GPT integration.
- Test and refine GPT rewrite process:
  - Determine if GPT can be used once or twice in the process (preferably once).
  - Instruct GPT to rewrite text to match the job description.

---

## Harith Safi
- Convert schema to LaTeX via YAML.
- Enable local storage of files.
- Conduct testing and deployment:
  - Record the process for documentation.

---

### Process Workflow
1. **Upload**: Files are uploaded.
2. **Parsing**: Uploaded files are parsed.
3. **GPT Rewrite**:
   - Rewrites bullet points to match the job description.
   - Optionally, this step can occur once or twice based on testing outcomes.
4. **LaTeX Formatting**: Processed text is sent to a LaTeX formatter.
5. **Compilation**: The formatted content is compiled into a PDF.
6. **Frontend Display**: The generated PDF is displayed on the frontend.
