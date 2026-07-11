import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSmartToy, MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { donationService, aiService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { FOOD_TYPE_LABELS, QUALITY_LABEL_CONFIG } from '../../utils/formatters';
import styles from './CreateDonation.module.css';

const STEPS = ['Basic Info', 'Details', 'AI Quality Check', 'Review'];

const INITIAL = {
  title: '', description: '', foodType: '', servingSize: '',
  quantity: { amount: '', unit: 'kg' },
  expiryDate: '', preparedDate: '', storageTemp: 'room_temp', packaging: 'sealed',
  location: { city: '', area: '', fullAddress: '' },
  isUrgent: false, allergens: [], notes: '',
};

const CreateDonation = () => {
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(INITIAL);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast    = useToast();

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const setNested = (parent, field, value) =>
    setForm((p) => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  const runAI = async () => {
    if (!form.foodType || !form.expiryDate) {
      toast.error('Food type and expiry date are required for AI analysis');
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await aiService.predictQuality({
        foodType: form.foodType,
        expiryDate: form.expiryDate,
        preparedDate: form.preparedDate || undefined,
        storageTemp: form.storageTemp,
        packaging: form.packaging,
        servingSize: Number(form.servingSize) || undefined,
      });
      setAiResult(data.data.prediction);
      toast.success('AI quality analysis complete!');
    } catch {
      toast.error('AI analysis failed. You can still proceed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        quantity: { ...form.quantity, amount: Number(form.quantity.amount) },
        servingSize: Number(form.servingSize) || undefined,
      };
      await donationService.create(payload);
      toast.success('Donation created successfully! 🎉');
      navigate('/donor/donations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create donation');
    } finally {
      setSubmitting(false);
    }
  };

  const qualityConfig = aiResult ? QUALITY_LABEL_CONFIG[aiResult.label] : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Create Donation</h1>
        <p>Fill in the details below. Our AI will analyse the food quality.</p>
      </div>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
            <div className={styles.stepNum}>{i < step ? <MdCheckCircle /> : i + 1}</div>
            <span className={styles.stepLabel}>{s}</span>
            {i < STEPS.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <div className="form-group">
              <label className="form-label">Donation Title *</label>
              <input className="form-input" placeholder="e.g. Fresh Biryani — 20 servings"
                value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Food Type *</label>
              <select className="form-select" value={form.foodType}
                onChange={(e) => set('foodType', e.target.value)}>
                <option value="">Select food type</option>
                {Object.entries(FOOD_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className="form-input" type="number" min="1"
                  placeholder="Amount" value={form.quantity.amount}
                  onChange={(e) => setNested('quantity', 'amount', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" value={form.quantity.unit}
                  onChange={(e) => setNested('quantity', 'unit', e.target.value)}>
                  {['kg','grams','litres','packets','servings','pieces'].map(u =>
                    <option key={u} value={u}>{u}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Approximate Servings</label>
              <input className="form-input" type="number" min="1"
                placeholder="How many people can this feed?"
                value={form.servingSize}
                onChange={(e) => set('servingSize', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={3}
                placeholder="Describe the food, ingredients, and any other info..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Expiry Date & Time *</label>
                <input className="form-input" type="datetime-local"
                  value={form.expiryDate}
                  onChange={(e) => set('expiryDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Prepared Date & Time</label>
                <input className="form-input" type="datetime-local"
                  value={form.preparedDate}
                  onChange={(e) => set('preparedDate', e.target.value)} />
              </div>
            </div>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Storage Temperature</label>
                <select className="form-select" value={form.storageTemp}
                  onChange={(e) => set('storageTemp', e.target.value)}>
                  <option value="room_temp">Room Temperature</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Packaging</label>
                <select className="form-select" value={form.packaging}
                  onChange={(e) => set('packaging', e.target.value)}>
                  <option value="sealed">Sealed</option>
                  <option value="partially_open">Partially Open</option>
                  <option value="open">Open</option>
                </select>
              </div>
            </div>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" placeholder="Mumbai"
                  value={form.location.city}
                  onChange={(e) => setNested('location', 'city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Area</label>
                <input className="form-input" placeholder="Andheri West"
                  value={form.location.area}
                  onChange={(e) => setNested('location', 'area', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <textarea className="form-textarea" rows={2}
                placeholder="Building / Street address for pickup..."
                value={form.location.fullAddress}
                onChange={(e) => setNested('location', 'fullAddress', e.target.value)} />
            </div>
            <label className={styles.urgentToggle}>
              <input type="checkbox" checked={form.isUrgent}
                onChange={(e) => set('isUrgent', e.target.checked)} />
              <span>🚨 Mark as Urgent (needs pickup ASAP)</span>
            </label>
          </div>
        )}

        {/* Step 2: AI Quality Check */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.aiSection}>
              <div className={styles.aiHeader}>
                <MdSmartToy className={styles.aiIcon} />
                <div>
                  <h3>AI Food Quality Analyser</h3>
                  <p>Our AI will evaluate the quality and safety of your donation.</p>
                </div>
              </div>

              {!aiResult ? (
                <button className="btn btn-primary" onClick={runAI} disabled={aiLoading}
                  id="ai-analyze-btn">
                  {aiLoading ? '🔄 Analysing…' : '🤖 Run AI Analysis'}
                </button>
              ) : (
                <div className={styles.aiResult}
                  style={{ background: qualityConfig?.bg, borderColor: qualityConfig?.color + '40' }}>
                  <div className={styles.aiScore}>
                    <div className={styles.scoreRing}
                      style={{ '--pct': aiResult.score, borderColor: qualityConfig?.color }}>
                      <span style={{ color: qualityConfig?.color }}>{aiResult.score}</span>
                    </div>
                    <div>
                      <div className={styles.aiLabel} style={{ color: qualityConfig?.color }}>
                        {aiResult.label}
                      </div>
                      <div className={styles.aiRec}>{aiResult.recommendation}</div>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAiResult(null)}>
                    Re-analyse
                  </button>
                </div>
              )}

              {aiResult?.label === 'Unsafe' && (
                <div className={styles.warning}>
                  ⚠️ This item scored as <strong>Unsafe</strong>. Please do not list food that may harm recipients.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Review Your Donation</h3>
            <div className={styles.reviewGrid}>
              {[
                ['Title', form.title],
                ['Food Type', FOOD_TYPE_LABELS[form.foodType]],
                ['Quantity', `${form.quantity.amount} ${form.quantity.unit}`],
                ['Servings', form.servingSize || '—'],
                ['Expiry', form.expiryDate],
                ['Storage', form.storageTemp],
                ['Packaging', form.packaging],
                ['City', form.location.city],
                ['Area', form.location.area || '—'],
                ['Urgent', form.isUrgent ? 'Yes 🚨' : 'No'],
                ...(aiResult ? [['AI Score', `${aiResult.score}/100 — ${aiResult.label}`]] : []),
              ].map(([k, v]) => (
                <div key={k} className={styles.reviewItem}>
                  <span className={styles.reviewKey}>{k}</span>
                  <span className={styles.reviewVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navBtns}>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep((p) => p - 1)}>
              <MdArrowBack /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep((p) => p + 1)}
              disabled={step === 0 && (!form.title || !form.foodType || !form.quantity.amount)}>
              Next <MdArrowForward />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit}
              disabled={submitting || aiResult?.label === 'Unsafe'} id="submit-donation-btn">
              {submitting ? 'Submitting…' : '✅ Submit Donation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDonation;
