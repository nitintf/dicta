import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 prose prose-invert max-w-none">
          <p className="text-muted-foreground text-sm">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                1. Introduction
              </h2>
              <p>
                Dicta (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is an
                open-source voice-to-text application for macOS. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you use our software. By using Dicta, you
                consent to the data practices described in this policy.
              </p>
              <p className="mt-4">
                <strong>Important:</strong> Dicta is provided &quot;as-is&quot;
                without warranties of any kind. This Privacy Policy does not
                create any legal obligations or contractual rights beyond what
                is required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">
                2.1 Voice Recordings
              </h3>
              <p>
                Dicta processes voice recordings that you create using the
                application. The handling of these recordings depends on the
                transcription method you choose:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  <strong>Local Processing:</strong> When using local models
                  (e.g., Local Whisper, Apple Speech Recognition), your voice
                  recordings are processed entirely on your device. We do not
                  collect, transmit, or store these recordings.
                </li>
                <li>
                  <strong>Cloud Processing:</strong> When using cloud-based
                  transcription services (e.g., OpenAI, Google Cloud, Deepgram,
                  AssemblyAI, ElevenLabs), your voice recordings may be
                  transmitted to third-party service providers. We do not
                  control or have access to these recordings once transmitted.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">
                2.2 Transcriptions
              </h3>
              <p>
                Transcribed text is stored locally on your device. We do not
                collect, transmit, or access your transcriptions unless you
                explicitly choose to export or share them.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">
                2.3 Application Data
              </h3>
              <p>Dicta may store the following data locally on your device:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Application settings and preferences</li>
                <li>Custom vocabulary entries</li>
                <li>Text snippets and templates</li>
                <li>Transcription history and metadata</li>
                <li>Model configuration preferences</li>
              </ul>
              <p className="mt-4">
                This data remains on your device and is not transmitted to us or
                any third parties.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">
                2.4 No Automatic Data Collection
              </h3>
              <p>
                Dicta does not automatically collect, transmit, or store any
                personal information, usage statistics, analytics, or telemetry
                data. We do not use tracking technologies, cookies, or similar
                mechanisms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                3. Third-Party Services
              </h2>
              <p>
                When you use cloud-based transcription services, your voice
                recordings and related data are processed by third-party
                providers. We are not responsible for the privacy practices of
                these third parties. You should review their privacy policies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  <strong>OpenAI:</strong>{' '}
                  <a
                    href="https://openai.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://openai.com/privacy
                  </a>
                </li>
                <li>
                  <strong>Google Cloud:</strong>{' '}
                  <a
                    href="https://cloud.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://cloud.google.com/privacy
                  </a>
                </li>
                <li>
                  <strong>Deepgram:</strong>{' '}
                  <a
                    href="https://deepgram.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://deepgram.com/privacy
                  </a>
                </li>
                <li>
                  <strong>AssemblyAI:</strong>{' '}
                  <a
                    href="https://www.assemblyai.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://www.assemblyai.com/privacy
                  </a>
                </li>
                <li>
                  <strong>ElevenLabs:</strong>{' '}
                  <a
                    href="https://elevenlabs.io/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://elevenlabs.io/privacy
                  </a>
                </li>
              </ul>
              <p className="mt-4">
                By using cloud-based services, you acknowledge that your data
                will be processed by these third parties according to their
                respective privacy policies and terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                4. Data Security
              </h2>
              <p>
                While we implement reasonable security measures for local data
                storage, no method of transmission or storage is 100% secure.
                You acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>You use Dicta at your own risk</li>
                <li>We cannot guarantee absolute security of your data</li>
                <li>
                  You are responsible for securing your device and any exported
                  data
                </li>
                <li>
                  We are not liable for any security breaches, data loss, or
                  unauthorized access
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                5. Your Rights and Choices
              </h2>
              <p>
                Since Dicta processes data locally on your device, you have full
                control over your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  You can delete transcriptions and recordings at any time
                </li>
                <li>
                  You can choose to use local-only processing to avoid cloud
                  transmission
                </li>
                <li>You can export or delete all application data</li>
                <li>
                  You can uninstall the application, which removes all local
                  data
                </li>
              </ul>
              <p className="mt-4">
                For data processed by third-party services, you must contact
                those providers directly to exercise your rights under
                applicable privacy laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                6. Children&apos;s Privacy
              </h2>
              <p>
                Dicta is not intended for use by individuals under the age of 13
                (or the applicable age of majority in your jurisdiction). We do
                not knowingly collect personal information from children. If you
                believe we have inadvertently collected information from a
                child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                7. International Users
              </h2>
              <p>
                Dicta is designed to process data locally on your device. If you
                use cloud-based services, your data may be processed in
                countries other than your own. By using cloud-based services,
                you consent to the transfer of your data to these countries,
                which may have different data protection laws than your
                jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on this page and updating the &quot;Last updated&quot;
                date. You are advised to review this Privacy Policy periodically
                for any changes.
              </p>
              <p className="mt-4">
                Your continued use of Dicta after any changes to this Privacy
                Policy constitutes your acceptance of such changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                9. Open Source Disclaimer
              </h2>
              <p>
                Dicta is open-source software licensed under the MIT License.
                The source code is publicly available, and you may review,
                modify, and distribute it according to the license terms. This
                Privacy Policy applies to the official Dicta application. If you
                use a modified version, different privacy practices may apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                10. Limitation of Liability
              </h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE SHALL NOT
                BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
                GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF
                DICTA.
              </p>
              <p className="mt-4">
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO
                YOUR USE OF DICTA SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE
                SOFTWARE (WHICH IS ZERO, AS DICTA IS PROVIDED FREE OF CHARGE).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                11. No Warranties
              </h2>
              <p>
                DICTA IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                12. Contact Information
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us through:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  GitHub Issues:{' '}
                  <a
                    href="https://github.com/nitintf/dicta/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://github.com/nitintf/dicta/issues
                  </a>
                </li>
                <li>
                  GitHub Discussions:{' '}
                  <a
                    href="https://github.com/nitintf/dicta/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://github.com/nitintf/dicta/discussions
                  </a>
                </li>
              </ul>
            </section>

            <section className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm">
                <strong>
                  By using Dicta, you acknowledge that you have read,
                  understood, and agree to be bound by this Privacy Policy.
                </strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
