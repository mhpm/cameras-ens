import './App.css';

function App() {
  return (
    <>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <header className="bg-neutral-800 shadow-m p-4">
          <div className="navbar bg-base text-center">
            <div className="flex-none"></div>
            <div className="flex-1">
              <a className="text-white text-3xl font-bold">
                1ra IAFCJ Ensenada
              </a>
              <p className="text-white text-lg">Control de Camaras</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <section className="flex justify-center flex-wrap items-start gap-2 w-full max-w-[95vw]">
            <div className="w-full lg:w-[49%]">
              <iframe
                src="iframes/atril/atril.html"
                className="rounded-2xl shadow-xl"
                title="OBS JCS 1"
                width="100%"
                height="700"
              ></iframe>
            </div>

            <div className="w-full lg:w-[49%]">
              <iframe
                src="iframes/cantantes/cantantes.html"
                className="rounded-2xl shadow-xl"
                title="OBS JCS 2"
                width="100%"
                height="700"
              ></iframe>
            </div>
          </section>
        </main>

        <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
          <aside>
            <p>Copyright © 2025 - All right reserved by 1ra IAFCJ Ensenada</p>
          </aside>
        </footer>

        <section className="card w-full max-w-md shadow-xl bg-base-100 hidden">
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
        </section>
      </div>
    </>
  );
}

export default App;
