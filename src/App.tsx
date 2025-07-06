import React, { useRef } from 'react';
import './App.css';
import { CameraControl } from './components';

type CameraIframeProps = {
  src: string;
  title: string;
};

const CameraIframe: React.FC<CameraIframeProps> = ({ src, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="w-full lg:w-[49%] relative">
      <iframe
        ref={iframeRef}
        src={src}
        className="rounded-2xl shadow-xl"
        title={title}
        width="100%"
        height="700"
        allow="fullscreen"
      ></iframe>
      <button
        onClick={handleFullscreen}
        className="btn btn-sm absolute top-3 right-3 bg-white bg-opacity-80 rounded px-3 py-1 shadow hover:bg-opacity-100 text-xl font-black"
        style={{ zIndex: 10 }}
        title="Pantalla completa"
      >
        ⛶
      </button>
    </div>
  );
};

function App() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-neutral-800 shadow-m p-4">
        <div className="navbar bg-base text-center">
          <div className="flex-none"></div>
          <div className="flex-1">
            <a className="text-white text-3xl font-bold">1ra IAFCJ Ensenada</a>
            <p className="text-white text-lg">Control de Camaras</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <section className="flex justify-center flex-wrap items-start gap-2 w-full max-w-[95vw]">
          <CameraIframe src="iframes/atril/atril.html" title="OBS JCS 1" />
          {/* <div className="w-full lg:w-[49%]">
            <CameraControl />
          </div> */}
          <CameraIframe
            src="iframes/cantantes/cantantes.html"
            title="OBS JCS 2"
          />
        </section>
      </main>

      <footer className="bg-neutral-800 shadow-m p-4 text-center">
        <p className="text-white text-sm">
          © 2025 1ra IAFCJ Ensenada. Todos los derechos reservados.
        </p>
      </footer>

      {/* <section className="card w-full max-w-md shadow-xl bg-base-100 hidden">
          <div className="card-body space-y-4">
            <div id="settingsbox" className="flex flex-col gap-2">
              <input
                type="text"
                id="serverIP"
                className="input input-bordered input-primary w-full"
                placeholder="OBS Server IP:Port"
              />
              <button
                type="button"
                // onClick="connectToServer();"
                className="btn btn-primary"
              >
                Conectar a OBS
              </button>
            </div>
            <div
              id="selectionbox"
              className="overflow-auto max-h-60 space-y-2"
            ></div>
            <div id="selectedTitleBox" className="hidden text-center">
              <span
                id="selectedTitleText"
                className="font-bold text-lg text-base-content px-2 py-1 rounded"
              ></span>
            </div>
            <div id="wearelivebox" className="hidden text-center">
              <span id="wearelivetext" className="font-bold text-2xl"></span>
            </div>
            <div
              id="NewColorStatus"
              className="w-full h-8 rounded transition-colors"
            ></div>
          </div>
        </section> */}
    </div>
  );
}

export default App;
