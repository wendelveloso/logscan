export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm shadow-sm z-60">
      <div className="max-w-5xl px-6 py-3 flex items-center">
        <div className="text-blue-600 font-semibold text-xl select-none cursor-default">
          <img
            src="/logomarca-xlogic.png"
            alt="Logo"
            className="h-12"
          />
        </div>
      </div>
    </header>
  );
}
