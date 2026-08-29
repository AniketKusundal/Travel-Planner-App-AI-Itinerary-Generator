import { useState, useEffect } from "react";
import { generatePackingList } from "../services/authApi";
import { useToast } from "../context/ToastContext";
import { Luggage, Sparkles, Copy, Plus, CheckSquare, Sun, CloudRain, Snowflake, MapPin, Calendar, Compass } from "lucide-react";

function PackingList() {
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Smart AI Packing Checklist Generator | WanderAI";
  }, []);
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    climate: "",
    activities: "",
  });

  const [loading, setLoading] = useState(false);
  const [packingData, setPackingData] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [customItem, setCustomItem] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      addToast("Please enter a destination city or country", "error");
      return;
    }
    if (!formData.climate) {
      addToast("Please select a climate/season option", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await generatePackingList({
        ...formData,
        duration: formData.duration || 3,
      });
      const data = res?.data || res;
      setPackingData(data);
      setCheckedItems({});
      addToast("Smart packing list generated!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to generate packing list", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (categoryName, item) => {
    const key = `${categoryName}-${item}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddCustomItem = (catIndex) => {
    if (!customItem.trim() || !packingData) return;
    const updatedCategories = [...packingData.categories];
    updatedCategories[catIndex].items.push(customItem.trim());
    setPackingData({ ...packingData, categories: updatedCategories });
    setCustomItem("");
    addToast("Custom item added!", "success");
  };

  // Calculate totals
  const allItems = packingData?.categories?.flatMap((cat) =>
    cat.items.map((item) => `${cat.name}-${item}`)
  ) || [];
  const totalCount = allItems.length;
  const packedCount = allItems.filter((key) => checkedItems[key]).length;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const copyChecklist = () => {
    if (!packingData) return;
    let text = `Packing Checklist for ${packingData.destination}\n`;
    text += `Weather: ${packingData.climateSummary || formData.climate}\n\n`;

    packingData.categories.forEach((cat) => {
      text += `${cat.name}:\n`;
      cat.items.forEach((item) => {
        const isChecked = checkedItems[`${cat.name}-${item}`];
        text += ` [${isChecked ? "x" : " "}] ${item}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    addToast("Checklist copied to clipboard!", "success");
  };

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Smart AI Packing Checklist</h1>
          <p className="dash-sub">Auto-generate a climate & activity tailored packing checklist</p>
        </div>
      </div>

      <div className="packing-grid">
        {/* Generator Form */}
        <div className="glass-card form-card">
          <h2 className="section-title">Trip Details</h2>
          <form onSubmit={handleGenerate} className="trip-form">
            <div className="form-group">
              <label className="form-label">Destination</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={18} />
                <input
                  type="text"
                  name="destination"
                  className="form-input"
                  placeholder="e.g. Tokyo, Paris, Bali, Manali"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (Days)</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    max="60"
                    placeholder="e.g. 3"
                    className="form-input"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Climate / Season</label>
                <div className="input-wrapper">
                  <Sun className="input-icon" size={18} />
                  <select
                    name="climate"
                    className="form-input"
                    value={formData.climate}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled hidden>Select Climate / Season</option>
                    <option value="Sunny & Tropical">Sunny & Tropical</option>
                    <option value="Mild & Seasonal">Mild & Seasonal</option>
                    <option value="Cold & Snow">Cold & Snow</option>
                    <option value="Rainy & Monsoon">Rainy & Monsoon</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Planned Activities</label>
              <div className="input-wrapper">
                <Compass className="input-icon" size={18} />
                <input
                  type="text"
                  name="activities"
                  className="form-input"
                  placeholder="e.g. Hiking, Beach, Fine Dining, Photography"
                  value={formData.activities}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "8px", padding: "14px" }}>
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> Generating AI Checklist...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Packing List
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results view */}
        <div className="glass-card result-card">
          {!packingData ? (
            <div className="empty-state">
              <Luggage size={48} className="empty-icon-svg" />
              <p className="muted-text">Fill in your trip details to generate a smart AI packing list.</p>
            </div>
          ) : (
            <div>
              <div className="packing-header">
                <div>
                  <h2 className="section-title">Checklist for {packingData.destination}</h2>
                  <p className="muted-text" style={{ fontSize: "0.85rem" }}>
                    {packingData.climateSummary}
                  </p>
                </div>
                <button className="btn-outline-sm" onClick={copyChecklist}>
                  <Copy size={14} /> Copy List
                </button>
              </div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-text">
                  <span>Packing Progress</span>
                  <span>{packedCount} / {totalCount} items ({progress}%)</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {/* Category tabs */}
              <div className="category-tabs">
                {packingData.categories.map((cat, idx) => (
                  <button
                    key={cat.name}
                    className={`cat-tab ${activeCategory === idx ? "cat-tab-active" : ""}`}
                    onClick={() => setActiveCategory(idx)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Category Items */}
              {packingData.categories[activeCategory] && (
                <div className="category-content">
                  <div className="item-list">
                    {packingData.categories[activeCategory].items.map((item) => {
                      const key = `${packingData.categories[activeCategory].name}-${item}`;
                      const isChecked = checkedItems[key];
                      return (
                        <label key={item} className={`checklist-item ${isChecked ? "item-checked" : ""}`}>
                          <input
                            type="checkbox"
                            checked={Boolean(isChecked)}
                            onChange={() => toggleCheck(packingData.categories[activeCategory].name, item)}
                          />
                          <span className="item-text">{item}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Add Custom Item */}
                  <div className="add-item-row">
                    <input
                      type="text"
                      className="form-input-sm"
                      placeholder={`Add item to ${packingData.categories[activeCategory].name}...`}
                      value={customItem}
                      onChange={(e) => setCustomItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomItem(activeCategory)}
                    />
                    <button
                      className="btn-primary-sm"
                      onClick={() => handleAddCustomItem(activeCategory)}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackingList;
