const Navbar = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-center md:justify-between items-center px-6 py-4">
        <a href="/">
          <div className="flex items-center gap-3">
            <img src="/logo-cmq2.png" alt="CardMachineQuote.com" className="h-14 w-auto object-contain" />
            <span className="sr-only">CardMachineQuote.com</span>
          </div>
        </a>
      </div>
    </header>
  )
}

export default Navbar