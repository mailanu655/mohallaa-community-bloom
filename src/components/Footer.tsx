const Footer = () => {
  return (
    <footer className="bg-white text-black py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center text-white font-bold text-xl">
                म
              </div>
              <span className="text-2xl font-bold">Mohallaa</span>
            </div>
            <p className="text-black/80 mb-6 max-w-md">
              Connecting Indian diaspora communities across America. Build relationships, 
              share culture, and grow together in your home away from home.
            </p>
            <div className="text-sm text-black/60">
              © 2024 Mohallaa. Building bridges, connecting hearts.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-black">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Find Your City</a></li>
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Start a Group</a></li>
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Events</a></li>
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Business Directory</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-black">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-black/80 hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-black/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-black/60 mb-4 md:mb-0">
              Made with ❤️ for the Indian diaspora community
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-black/80 hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-black/80 hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-black/80 hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;