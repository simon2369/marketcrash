import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from '@/components/layout/navbar';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white hover:text-slate-200 transition-colors cursor-pointer">
              📊 Market Crash Monitor
            </h1>
          </Link>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation Bar */}
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Contact Us</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Get in touch with us for questions, feedback, or support. We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-1">Email</h3>
                  <a
                    href="mailto:marketcrashmonitor@proton.me"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    marketcrashmonitor@proton.me
                  </a>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-1">Response Time</h3>
                  <p className="text-slate-300">We typically respond within 24-48 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">What can we help with?</h2>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• General inquiries</li>
                <li>• Technical support</li>
                <li>• Feature requests</li>
                <li>• Data questions</li>
                <li>• Partnership opportunities</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

