import { useState } from 'react';

function CapsuleForm({ onSubmit, editingCapsule }) {
  const [projectName, setProjectName] = useState(editingCapsule?.project_name || '');
  const [promptTitle, setPromptTitle] = useState(editingCapsule?.prompt_title || '');
  const [promptVersion, setPromptVersion] = useState(editingCapsule?.prompt_version || '');
  const [promptText, setPromptText] = useState(editingCapsule?.prompt_text || '');
  const [responseSummary, setResponseSummary] = useState(editingCapsule?.response_summary || '');
  const [category, setCategory] = useState(editingCapsule?.category || '');
  const [usefulness, setUsefulness] = useState(editingCapsule?.usefulness || '');
  const [reviewed, setReviewed] = useState(!!editingCapsule?.reviewed);
  const [improved, setImproved] = useState(!!editingCapsule?.improved);
  const [screenshotUrl, setScreenshotUrl] = useState(editingCapsule?.screenshot_url || '');
  const [notes, setNotes] = useState(editingCapsule?.notes || '');

    function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      project_name: projectName,
      prompt_title: promptTitle,
      prompt_version: promptVersion,
      prompt_text: promptText,
      response_summary: responseSummary,
      category,
      usefulness,
      reviewed,
      improved,
      screenshot_url: screenshotUrl,
      notes
    });
    setProjectName('');
    setPromptTitle('');
    setPromptVersion('');
    setPromptText('');
    setResponseSummary('');
    setCategory('');
    setUsefulness('');
    setReviewed(false);
    setImproved(false);
    setScreenshotUrl('');
    setNotes('');
  }

    return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Project name *</label>
        <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
      </div>
      <div className="field">
        <label>Prompt title *</label>
        <input value={promptTitle} onChange={(e) => setPromptTitle(e.target.value)} required />
      </div>
      <div className="field">
        <label>Prompt version</label>
        <input value={promptVersion} onChange={(e) => setPromptVersion(e.target.value)} />
      </div>
      <div className="field">
        <label>Prompt text *</label>
        <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} required />
      </div>
      <div className="field">
        <label>Response summary</label>
        <textarea value={responseSummary} onChange={(e) => setResponseSummary(e.target.value)} />
      </div>
      <div className="field">
        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="field">
        <label>Usefulness</label>
        <input value={usefulness} onChange={(e) => setUsefulness(e.target.value)} />
      </div>
      <div className="checkbox-row">
        <input type="checkbox" id="reviewed" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
        <label htmlFor="reviewed">Reviewed</label>
      </div>
      <div className="checkbox-row">
        <input type="checkbox" id="improved" checked={improved} onChange={(e) => setImproved(e.target.checked)} />
        <label htmlFor="improved">Improved</label>
      </div>
      <div className="field">
        <label>Screenshot URL</label>
        <input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} />
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary">Save Capsule</button>
    </form>
  );
  
}

export default CapsuleForm;
