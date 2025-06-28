import React from 'react';
import { Video, Mail, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" id="support">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">VideoTrim Pro</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The fastest way to trim and download YouTube videos. Save hours of editing time 
              with our professional-grade video trimming tool.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:support@videotrimpro.com"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="mailto:support@videotrimpro.com" className="hover:text-white transition-colors">
                  Email Support
                </a>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  Live Chat
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/refund" className="hover:text-white transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 VideoTrim Pro. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
              Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for creators worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;