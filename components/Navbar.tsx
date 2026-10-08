import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 start-0 z-20 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3">
          <Image src="/assets/images/kulaka.png" alt="Kulaka Learning Logo" width={32} height={32} unoptimized style={{ height: '2rem', width: '2rem' }} />
        </a>

        {/* Actions */}
        <div className="flex items-center space-x-3 md:order-2">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Get Started
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden"
            aria-label="Open main menu"
          >
            <svg
              className="h-6 w-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 7h14M5 12h14M5 17h14"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto">
          <ul className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-4 font-medium md:flex-row md:gap-8 md:border-0 md:p-0">
            <li>
              <a
                href="#"
                className="block rounded px-3 py-2 text-blue-600 md:p-0"
              >
                Home
              </a>
            </li>

            <li>
              <a
                href="#"
                className="block rounded px-3 py-2 text-gray-700 transition hover:text-blue-600 md:p-0"
              >
                Courses
              </a>
            </li>

            <li>
              <a
                href="#"
                className="block rounded px-3 py-2 text-gray-700 transition hover:text-blue-600 md:p-0"
              >
                About
              </a>
            </li>

            <li>
              <a
                href="#"
                className="block rounded px-3 py-2 text-gray-700 transition hover:text-blue-600 md:p-0"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
