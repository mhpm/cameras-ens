import React, { useState, useEffect } from 'react';

type CameraConfig = {
  ip: string;
  flip: number;
  mirror: number;
  invertcontrols: number;
  infinitypt: number;
  infinityzoom: number;
  infinityfocus: number;
  panspeed: number;
  zoomspeed: number;
  tiltspeed: number;
  focusspeed: number;
  autopaninterval: number;
};

const defaultConfig: CameraConfig = {
  ip: '192.168.0.101',
  flip: 1,
  mirror: 1,
  invertcontrols: 1,
  infinitypt: 0,
  infinityzoom: 0,
  infinityfocus: 0,
  panspeed: 8,
  zoomspeed: 5,
  tiltspeed: 8,
  focusspeed: 3,
  autopaninterval: 60,
};

const PRESET_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19,
];

const imgBase = '/iframes/atril/images/';
const controlImages = {
  panUp: imgBase + 'pantilt-up.png',
  panDown: imgBase + 'pantilt-down.png',
  panLeft: imgBase + 'pantilt-left.png',
  panRight: imgBase + 'pantilt-right.png',
  panHome: imgBase + 'pantilt-home.png',
  zoomIn: imgBase + 'pantilt-up-active.png', // Replace with zoom-in image if available
  zoomOut: imgBase + 'pantilt-down-active.png', // Replace with zoom-out image if available
  focusIn: imgBase + 'focus-in.png',
  focusOut: imgBase + 'focus-out.png',
};

export const CameraControl: React.FC = () => {
  const [config, setConfig] = useState<CameraConfig>(() => {
    const stored = localStorage.getItem('configStorage');
    let base = { ...defaultConfig };
    if (stored) {
      try {
        base = { ...base, ...JSON.parse(stored) };
      } catch {}
    }
    return base;
  });
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const baseUrl = `http://${config.ip}/cgi-bin`;

  useEffect(() => {
    localStorage.setItem('configStorage', JSON.stringify(config));
  }, [config]);

  // Camera actions
  const runAction = (url: string) => {
    fetch(url).catch(() => {});
  };

  const configSetting = (action: keyof CameraConfig, value: number) => {
    runAction(`${baseUrl}/param.cgi?post_image_value&${action}&${value}`);
    setConfig((prev) => ({ ...prev, [action]: value }));
  };

  const camPantilt = (action: string) => {
    let cmd = action;
    if (config.invertcontrols === 1) {
      if (action === 'left') cmd = 'right';
      else if (action === 'right') cmd = 'left';
      else if (action === 'up') cmd = 'down';
      else if (action === 'down') cmd = 'up';
    }
    runAction(
      `${baseUrl}/ptzctrl.cgi?ptzcmd&${cmd}&${config.panspeed}&${config.tiltspeed}`
    );
  };

  const camZoom = (action: string) => {
    runAction(`${baseUrl}/ptzctrl.cgi?ptzcmd&${action}&${config.zoomspeed}`);
  };

  const camFocus = (action: string) => {
    runAction(`${baseUrl}/ptzctrl.cgi?ptzcmd&${action}&${config.focusspeed}`);
  };

  const camPreset = (preset: number, action: 'poscall' | 'posset') => {
    runAction(`${baseUrl}/ptzctrl.cgi?ptzcmd&${action}&${preset}`);
    if (action === 'poscall') setActivePreset(preset);
  };

  // UI Handlers
  const handlePresetClick = (preset: number) => {
    camPreset(preset, 'poscall');
  };

  const handleAssignPreset = (preset: number | string) => {
    let num =
      preset === 'Auto Panorámica - Posición Inicial Izquierda'
        ? 11
        : Number(preset);
    camPreset(num, 'posset');
  };

  const handleSettingToggle = (key: keyof CameraConfig) => {
    setConfig((prev) => {
      const value = prev[key] === 1 ? 0 : 1;
      configSetting(key, value);
      return { ...prev, [key]: value };
    });
  };

  const handleSpeedChange = (key: keyof CameraConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleIpChange = (ip: string) => {
    setConfig((prev) => ({ ...prev, ip }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <div className="card shadow-2xl bg-neutral w-full flex-1 rounded-3xl">
        <div className="bg-neutral-500 rounded-t-2xl px-6 py-3 flex items-center justify-between">
          <h2 className="text-white text-3xl font-bold tracking-wide">
            CÁMARA ATRIL
          </h2>
          <button
            className="btn btn-circle btn-ghost text-2xl text-white"
            title="Pantalla completa"
          >
            ⛶
          </button>
        </div>
        <div className="bg-neutral-900 px-0 py-0 rounded-b-2xl">
          <div className="flex flex-row justify-between items-center px-6 pt-3 pb-1 border-b border-neutral-800">
            <div className="flex gap-8">
              <button
                className="btn btn-link no-underline text-lg text-gray-200 tracking-widest"
                onClick={() => setShowPresetsModal(true)}
              >
                ASIGNAR POSICIÓN
              </button>
              <button
                className="btn btn-link no-underline text-lg text-gray-200 tracking-widest"
                onClick={() => setShowSettingsModal(true)}
              >
                PREFERENCIAS
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Preset grid */}
            <div className="bg-black rounded-xl border-4 border-blue-700 p-3">
              <div className="grid grid-cols-6 gap-2 mb-2">
                {PRESET_NUMBERS.map((num) => (
                  <button
                    key={num}
                    className={`rounded-lg border-2 border-neutral-700 bg-neutral-800 hover:border-blue-400 transition-all duration-150 w-full h-[80px] ${
                      activePreset === num ? 'ring-4 ring-blue-400' : ''
                    }`}
                    style={{
                      background: `url(${imgBase}${num}.png) center/cover no-repeat, #222`,
                    }}
                    onClick={() => handlePresetClick(num)}
                    aria-label={`Preset ${num}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {/* <button
                  className="btn btn-square btn-neutral btn-outline text-xl"
                  style={{ width: 48, height: 48 }}
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor">
                    <path
                      d="M12 4v16m8-8H4"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button> */}
                <button className="btn btn-neutral flex-1 text-lg font-bold">
                  AUTO PAN
                </button>
              </div>
              {/* Controls */}
              <div className="flex flex-row gap-8 mt-4">
                {/* Zoom & Focus */}
                <div className="flex flex-col gap-2 items-center">
                  <span className="text-xs text-gray-400 mb-1">+</span>
                  <button
                    onMouseDown={() => camZoom('zoomin')}
                    onMouseUp={() => camZoom('zoomstop')}
                    className="btn btn-ghost p-0"
                  >
                    <img src={controlImages.zoomIn} alt="Zoom +" width={32} />
                  </button>
                  <button
                    onMouseDown={() => camZoom('zoomout')}
                    onMouseUp={() => camZoom('zoomstop')}
                    className="btn btn-ghost p-0"
                  >
                    <img src={controlImages.zoomOut} alt="Zoom -" width={32} />
                  </button>
                  <span className="text-xs text-gray-400 mt-1">-</span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <span className="text-xs text-gray-400 mb-1">•</span>
                  <button
                    onMouseDown={() => camFocus('focusin')}
                    onMouseUp={() => camFocus('focusstop')}
                    className="btn btn-ghost p-0"
                  >
                    <img src={controlImages.focusIn} alt="Focus +" width={32} />
                  </button>
                  <button
                    onMouseDown={() => camFocus('focusout')}
                    onMouseUp={() => camFocus('focusstop')}
                    className="btn btn-ghost p-0"
                  >
                    <img
                      src={controlImages.focusOut}
                      alt="Focus -"
                      width={32}
                    />
                  </button>
                  <span className="text-xs text-gray-400 mt-1">•</span>
                </div>
                {/* PTZ */}
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onMouseDown={() => camPantilt('up')}
                      onMouseUp={() => camPantilt('ptzstop')}
                      className="btn btn-square btn-ghost"
                    >
                      <img src={controlImages.panUp} alt="▲" width={32} />
                    </button>
                    <div className="flex flex-row items-center">
                      <button
                        onMouseDown={() => camPantilt('left')}
                        onMouseUp={() => camPantilt('ptzstop')}
                        className="btn btn-square btn-ghost"
                      >
                        <img src={controlImages.panLeft} alt="◀" width={32} />
                      </button>
                      <button
                        onMouseDown={() => camPantilt('home')}
                        onMouseUp={() => camPantilt('ptzstop')}
                        className="btn btn-square btn-ghost"
                      >
                        <img src={controlImages.panHome} alt="●" width={32} />
                      </button>
                      <button
                        onMouseDown={() => camPantilt('right')}
                        onMouseUp={() => camPantilt('ptzstop')}
                        className="btn btn-square btn-ghost"
                      >
                        <img src={controlImages.panRight} alt="▶" width={32} />
                      </button>
                    </div>
                    <button
                      onMouseDown={() => camPantilt('down')}
                      onMouseUp={() => camPantilt('ptzstop')}
                      className="btn btn-square btn-ghost"
                    >
                      <img src={controlImages.panDown} alt="▼" width={32} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modals */}
        {showPresetsModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <button
                onClick={() => setShowPresetsModal(false)}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
              <h4 className="font-bold text-lg mb-2">Asignar Posición</h4>
              <p className="mb-4">
                Mueve la cámara a la Posición/Zoom deseada y haz click en el
                número que deseas asignar.
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_NUMBERS.map((num) => (
                  <button
                    key={num}
                    className="btn btn-outline btn-primary w-12 h-12"
                    onClick={() => handleAssignPreset(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="btn btn-outline btn-primary w-full mt-2"
                  onClick={() =>
                    handleAssignPreset(
                      'Auto Panorámica - Posición Inicial Izquierda'
                    )
                  }
                >
                  Auto Panorámica - Posición Inicial Izquierda
                </button>
              </div>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setShowPresetsModal(false)}
                >
                  Listo!
                </button>
              </div>
            </div>
          </div>
        )}
        {showSettingsModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
              <h4 className="font-bold text-lg mb-2">Preferencias</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className="btn btn-outline"
                  onClick={() => handleSettingToggle('flip')}
                >
                  Flip: {config.flip ? 'Sí' : 'No'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSettingToggle('mirror')}
                >
                  Mirror: {config.mirror ? 'Sí' : 'No'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSettingToggle('invertcontrols')}
                >
                  Invertir Controles: {config.invertcontrols ? 'Sí' : 'No'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSettingToggle('infinitypt')}
                >
                  Infinity Pan/Tilt: {config.infinitypt ? 'Sí' : 'No'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSettingToggle('infinityzoom')}
                >
                  Zoom Infinito: {config.infinityzoom ? 'Sí' : 'No'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSettingToggle('infinityfocus')}
                >
                  Enfoque Infinito: {config.infinityfocus ? 'Sí' : 'No'}
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">
                  Velocidad Panorámica
                </label>
                <select
                  className="select select-bordered w-full mb-2"
                  value={config.panspeed}
                  onChange={(e) =>
                    handleSpeedChange('panspeed', Number(e.target.value))
                  }
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <label className="block text-sm mb-1">Velocidad Zoom</label>
                <select
                  className="select select-bordered w-full mb-2"
                  value={config.zoomspeed}
                  onChange={(e) =>
                    handleSpeedChange('zoomspeed', Number(e.target.value))
                  }
                >
                  {Array.from({ length: 8 }, (_, i) => i).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <label className="block text-sm mb-1">
                  Velocidad Inclinación
                </label>
                <select
                  className="select select-bordered w-full mb-2"
                  value={config.tiltspeed}
                  onChange={(e) =>
                    handleSpeedChange('tiltspeed', Number(e.target.value))
                  }
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <label className="block text-sm mb-1">Velocidad Enfoque</label>
                <select
                  className="select select-bordered w-full mb-2"
                  value={config.focusspeed}
                  onChange={(e) =>
                    handleSpeedChange('focusspeed', Number(e.target.value))
                  }
                >
                  {Array.from({ length: 8 }, (_, i) => i).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <label className="block text-sm mb-1">
                  Intervalo de panorámica automático
                </label>
                <select
                  className="select select-bordered w-full"
                  value={config.autopaninterval}
                  onChange={(e) =>
                    handleSpeedChange('autopaninterval', Number(e.target.value))
                  }
                >
                  {[30, 45, 60, 90, 120].map((v) => (
                    <option key={v} value={v}>
                      {v} segundos
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Dirección IP</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={config.ip}
                  onChange={(e) => handleIpChange(e.target.value)}
                />
                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => setConfig({ ...config })}
                >
                  Recargar Cámara
                </button>
              </div>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Listo!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
