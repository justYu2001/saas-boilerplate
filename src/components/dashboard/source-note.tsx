interface SourceNoteProps {
  /** Repository-relative path of the file that renders the current page. */
  path: string;
}

/**
 * Says which file to open to fill this page in.
 *
 * The dashboard ships with a finished shell and an empty canvas, so the canvas
 * has to explain itself rather than stand in with sample charts a fork would
 * have to hunt down and delete. Monospace here is the literal, not a costume:
 * this is a path to type.
 *
 * Delete this component along with the last call site once real pages exist.
 */
export const SourceNote = ({ path }: SourceNoteProps) => {
  return (
    <p className="text-muted-foreground mt-8 text-sm">
      Build this page in{" "}
      <code className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-[0.8125rem]">
        {path}
      </code>
      {/* Adjacent to the chip: JSX would turn a newline here into a space,
          leaving the sentence to end with a floating full stop. */}
      {"."}
    </p>
  );
};
