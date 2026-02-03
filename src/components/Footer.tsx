'use client';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gray-950 border-t border-gray-800 py-4 mt-auto">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Designed by{' '}
                        <span className="text-orange-400 font-medium">Smartdwell Technologies</span>
                    </p>
                    <span className="hidden sm:inline text-gray-600">|</span>
                    <p className="text-gray-500 text-sm">
                        Developed for{' '}
                        <span className="text-blue-400 font-medium">Larsen & Toubro</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
