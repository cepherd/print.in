import React from 'react';
import { PrintSettings } from '../utils/fileUtils';

interface PrintSettingsProps {
  settings: PrintSettings;
  onSettingsChange: (newSettings: PrintSettings) => void;
  fileType?: string;
}

export function PrintSettingsComponent({ settings, onSettingsChange, fileType }: PrintSettingsProps) {
  const handleChange = (key: keyof PrintSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="print-settings-panel no-print">
      <div className="settings-header">
        <h3>Print Settings</h3>
      </div>
      
      <div className="settings-grid">
        {/* Orientation */}
        <div className="settings-group">
          <label>Orientation</label>
          <div className="segmented-control">
            <button 
              className={settings.orientation === 'portrait' ? 'active' : ''} 
              onClick={() => handleChange('orientation', 'portrait')}
            >
              Portrait
            </button>
            <button 
              className={settings.orientation === 'landscape' ? 'active' : ''} 
              onClick={() => handleChange('orientation', 'landscape')}
            >
              Landscape
            </button>
          </div>
        </div>

        {/* Page Size */}
        <div className="settings-group">
          <label htmlFor="page-size">Page Size</label>
          <select 
            id="page-size"
            value={settings.pageSize} 
            onChange={(e) => handleChange('pageSize', e.target.value)}
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
            <option value="Tabloid">Tabloid</option>
          </select>
        </div>

        {/* Margins */}
        <div className="settings-group">
          <label htmlFor="margins">Margins</label>
          <select 
            id="margins"
            value={settings.margin} 
            onChange={(e) => handleChange('margin', e.target.value)}
          >
            <option value="none">None</option>
            <option value="normal">Normal (1cm)</option>
            <option value="narrow">Narrow (0.5cm)</option>
            <option value="wide">Wide (2cm)</option>
          </select>
        </div>

        {/* Scale */}
        <div className="settings-group">
          <div className="label-with-value">
            <label htmlFor="scale">Scale</label>
            <span>{settings.scale}%</span>
          </div>
          <input 
            type="range" 
            id="scale"
            min="50" 
            max="200" 
            step="5"
            value={settings.scale} 
            onChange={(e) => handleChange('scale', parseInt(e.target.value))}
            disabled={settings.fitToPage}
          />
        </div>

        {/* Fit to Page */}
        <div className="settings-group checkbox-group">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={settings.fitToPage} 
              onChange={(e) => handleChange('fitToPage', e.target.checked)}
            />
            <span className="checkmark"></span>
            Fit to Page
          </label>
        </div>

        {/* Grid & Duplicates (Image only) */}
        {fileType === 'image' && (
          <>
            <div className="settings-divider"></div>
            <div className="settings-header">
              <h3>Smart Grid & Copies</h3>
            </div>

            <div className="settings-group">
              <div className="label-with-value">
                <label htmlFor="copies">Number of Copies</label>
                <span>{settings.copies}</span>
              </div>
              <input 
                type="range" 
                id="copies"
                min="1" 
                max="50" 
                value={settings.copies} 
                onChange={(e) => handleChange('copies', parseInt(e.target.value))}
              />
            </div>

            {settings.copies > 1 && (
              <>
                <div className="settings-group">
                  <div className="label-with-value">
                    <label htmlFor="gridColumns">Grid Columns</label>
                    <span>{settings.gridColumns}</span>
                  </div>
                  <input 
                    type="range" 
                    id="gridColumns"
                    min="1" 
                    max="10" 
                    value={settings.gridColumns} 
                    onChange={(e) => handleChange('gridColumns', parseInt(e.target.value))}
                  />
                </div>

                <div className="settings-group">
                  <div className="label-with-value">
                    <label htmlFor="gridGap">Gap (px)</label>
                    <span>{settings.gridGap}px</span>
                  </div>
                  <input 
                    type="range" 
                    id="gridGap"
                    min="0" 
                    max="50" 
                    value={settings.gridGap} 
                    onChange={(e) => handleChange('gridGap', parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
