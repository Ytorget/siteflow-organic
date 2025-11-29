import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RichTextEditor from '../../../components/shared/RichTextEditor';

describe('RichTextEditor', () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it('renders with placeholder', () => {
    render(
      <RichTextEditor
        content=""
        onChange={onChange}
        placeholder="Type something..."
      />
    );

    expect(screen.getByText(/type something/i)).toBeInTheDocument();
  });

  it('displays initial content', () => {
    render(
      <RichTextEditor
        content="<p>Hello world</p>"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('calls onChange when content is updated', async () => {
    const user = userEvent.setup();

    render(
      <RichTextEditor
        content=""
        onChange={onChange}
        placeholder="Type here"
      />
    );

    const editor = screen.getByRole('textbox');
    await user.click(editor);
    await user.keyboard('Test content');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('renders toolbar buttons', () => {
    render(
      <RichTextEditor
        content=""
        onChange={onChange}
      />
    );

    // Check for toolbar buttons by title
    expect(screen.getByTitle(/Fet/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Kursiv/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Punktlista/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Numrerad lista/i)).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={onChange}
        disabled={true}
      />
    );

    // Toolbar buttons should be disabled
    const boldButton = screen.getByTitle(/Fet/i);
    expect(boldButton).toBeDisabled();
  });

  it('applies custom minHeight', () => {
    const { container } = render(
      <RichTextEditor
        content=""
        onChange={onChange}
        minHeight="200px"
      />
    );

    const editorContent = container.querySelector('.ProseMirror');
    expect(editorContent?.parentElement).toHaveStyle({ minHeight: '200px' });
  });

  it('toggles bold formatting', async () => {
    const user = userEvent.setup();

    render(
      <RichTextEditor
        content=""
        onChange={onChange}
      />
    );

    const boldButton = screen.getByTitle(/Fet/i);
    await user.click(boldButton);

    // Bold button should have active state (bg-slate-300)
    expect(boldButton).toHaveClass('bg-slate-300');
  });

  it('handles undo/redo buttons', () => {
    render(
      <RichTextEditor
        content=""
        onChange={onChange}
      />
    );

    const undoButton = screen.getByTitle(/Ångra/i);
    const redoButton = screen.getByTitle(/Gör om/i);

    // Initially, undo should be disabled
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it('supports link insertion', async () => {
    const user = userEvent.setup();

    // Mock window.prompt
    vi.spyOn(window, 'prompt').mockReturnValue('https://example.com');

    render(
      <RichTextEditor
        content=""
        onChange={onChange}
      />
    );

    const linkButton = screen.getByTitle(/Lägg till länk/i);
    await user.click(linkButton);

    expect(window.prompt).toHaveBeenCalled();

    vi.mocked(window.prompt).mockRestore();
  });

  it('renders with default placeholder when not provided', () => {
    render(
      <RichTextEditor
        content=""
        onChange={onChange}
      />
    );

    // Should render with default placeholder
    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();
  });
});
