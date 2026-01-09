import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
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
                1. Acceptance of Terms
              </h2>
              <p>
                By downloading, installing, accessing, or using Dicta (&quot;the
                Software&quot;), you agree to be bound by these Terms of Service
                (&quot;Terms&quot;). If you do not agree to these Terms, you
                must not use the Software and should uninstall it immediately.
              </p>
              <p className="mt-4">
                These Terms constitute a legally binding agreement between you
                (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and the
                Dicta project maintainers (&quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;). If you are using the Software on behalf of an
                organization, you represent that you have authority to bind that
                organization to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                2. Description of Service
              </h2>
              <p>
                Dicta is an open-source voice-to-text transcription application
                for macOS that enables users to convert speech into text using
                various AI-powered transcription services. The Software may be
                used with local processing models or cloud-based third-party
                services.
              </p>
              <p className="mt-4">
                We reserve the right to modify, suspend, or discontinue any
                aspect of the Software at any time, with or without notice,
                without liability to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                3. License Grant
              </h2>
              <p>
                Dicta is licensed under the MIT License. Subject to your
                compliance with these Terms and the MIT License, we grant you a
                limited, non-exclusive, non-transferable, revocable license to
                use the Software for personal or commercial purposes.
              </p>
              <p className="mt-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  Copy, modify, or create derivative works of the Software
                  except as permitted by the MIT License
                </li>
                <li>
                  Reverse engineer, decompile, or disassemble the Software
                  except as permitted by law
                </li>
                <li>
                  Remove or alter any copyright, trademark, or other proprietary
                  notices
                </li>
                <li>
                  Use the Software in any manner that violates applicable laws
                  or regulations
                </li>
                <li>Use the Software to infringe upon the rights of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                4. User Responsibilities
              </h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  Use the Software only for lawful purposes and in accordance
                  with these Terms
                </li>
                <li>
                  Obtain all necessary permissions and consents before recording
                  or transcribing any content
                </li>
                <li>
                  Comply with all applicable laws, regulations, and third-party
                  terms of service
                </li>
                <li>
                  Maintain the security of your device and any API keys or
                  credentials
                </li>
                <li>
                  Not use the Software to violate any intellectual property
                  rights
                </li>
                <li>
                  Not use the Software to transmit malicious code, viruses, or
                  harmful content
                </li>
                <li>
                  Not attempt to gain unauthorized access to any systems or
                  networks
                </li>
                <li>
                  Not use the Software in any way that could damage, disable, or
                  impair the Software
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                5. Third-Party Services
              </h2>
              <p>
                Dicta may integrate with third-party transcription services
                (e.g., OpenAI, Google Cloud, Deepgram, AssemblyAI, ElevenLabs).
                Your use of these services is subject to their respective terms
                of service and privacy policies.
              </p>
              <p className="mt-4">We are not responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  The availability, accuracy, or performance of third-party
                  services
                </li>
                <li>
                  Any fees, charges, or billing associated with third-party
                  services
                </li>
                <li>
                  Any data processing, storage, or handling by third-party
                  services
                </li>
                <li>
                  Any changes, discontinuations, or modifications to third-party
                  services
                </li>
              </ul>
              <p className="mt-4">
                You acknowledge that we have no control over third-party
                services and that your use of such services is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                6. Intellectual Property
              </h2>
              <p>
                The Software, including its source code, documentation, and all
                related materials, is protected by copyright, trademark, and
                other intellectual property laws. The Software is provided under
                the MIT License, which permits use, modification, and
                distribution subject to the license terms.
              </p>
              <p className="mt-4">
                You retain all rights to any content you create, record, or
                transcribe using the Software. We do not claim ownership of your
                content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                7. Disclaimer of Warranties
              </h2>
              <p className="font-semibold text-lg">
                THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>IMPLIED WARRANTIES OF MERCHANTABILITY</li>
                <li>FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>NON-INFRINGEMENT</li>
                <li>COURSE OF PERFORMANCE</li>
                <li>
                  ACCURACY, RELIABILITY, OR COMPLETENESS OF TRANSCRIPTIONS
                </li>
                <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
                <li>SECURITY OR FREEDOM FROM VIRUSES OR MALICIOUS CODE</li>
              </ul>
              <p className="mt-4">
                We do not warrant that the Software will meet your requirements,
                operate without interruption, be error-free, or be secure. You
                acknowledge that transcription accuracy may vary and that the
                Software may not be suitable for all purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                8. Limitation of Liability
              </h2>
              <p className="font-semibold text-lg">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED
                TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>LOSS OF PROFITS, REVENUE, DATA, OR USE</li>
                <li>BUSINESS INTERRUPTION</li>
                <li>LOSS OF GOODWILL OR REPUTATION</li>
                <li>COST OF SUBSTITUTE SERVICES</li>
                <li>
                  DAMAGES ARISING FROM TRANSCRIPTION ERRORS OR INACCURACIES
                </li>
                <li>DAMAGES ARISING FROM DATA LOSS OR CORRUPTION</li>
                <li>DAMAGES ARISING FROM UNAUTHORIZED ACCESS TO YOUR DATA</li>
                <li>
                  DAMAGES ARISING FROM USE OR INABILITY TO USE THE SOFTWARE
                </li>
              </ul>
              <p className="mt-4">
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO
                YOUR USE OF THE SOFTWARE SHALL NOT EXCEED THE AMOUNT YOU PAID
                FOR THE SOFTWARE. SINCE DICTA IS PROVIDED FREE OF CHARGE, OUR
                TOTAL LIABILITY IS LIMITED TO ZERO DOLLARS ($0.00).
              </p>
              <p className="mt-4">
                Some jurisdictions do not allow the exclusion or limitation of
                certain damages, so some of the above limitations may not apply
                to you. In such cases, our liability will be limited to the
                maximum extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                9. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless us, our
                contributors, and our affiliates from and against any and all
                claims, damages, obligations, losses, liabilities, costs, or
                debt, and expenses (including but not limited to attorney&apos;s
                fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your use or misuse of the Software</li>
                <li>Your violation of these Terms</li>
                <li>
                  Your violation of any third-party rights, including
                  intellectual property rights
                </li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>
                  Any content you create, record, or transcribe using the
                  Software
                </li>
                <li>Your use of third-party services through the Software</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                10. Prohibited Uses
              </h2>
              <p>You may not use the Software:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  In any way that violates applicable federal, state, local, or
                  international laws or regulations
                </li>
                <li>
                  To record or transcribe content without proper authorization
                  or consent
                </li>
                <li>
                  To infringe upon intellectual property rights, including
                  copyrights, trademarks, or patents
                </li>
                <li>
                  To transmit, store, or process illegal, harmful, or offensive
                  content
                </li>
                <li>
                  To violate privacy rights or confidentiality obligations
                </li>
                <li>
                  To engage in any fraudulent, deceptive, or misleading
                  activities
                </li>
                <li>
                  To interfere with or disrupt the operation of the Software or
                  any connected systems
                </li>
                <li>
                  To attempt to gain unauthorized access to any systems,
                  networks, or data
                </li>
                <li>
                  To use automated systems to access the Software in a manner
                  that sends more requests than a human could reasonably produce
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                11. Termination
              </h2>
              <p>
                We reserve the right to terminate or suspend your access to the
                Software at any time, with or without cause or notice, for any
                reason, including but not limited to your breach of these Terms.
              </p>
              <p className="mt-4">
                Upon termination, your right to use the Software will
                immediately cease. You may terminate your use of the Software at
                any time by uninstalling it from your device.
              </p>
              <p className="mt-4">
                Sections of these Terms that by their nature should survive
                termination (including but not limited to disclaimers,
                limitations of liability, and indemnification) shall survive
                termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                12. Open Source Contributions
              </h2>
              <p>
                If you contribute code, documentation, or other materials to the
                Dicta project, you grant us and all users of the Software a
                perpetual, worldwide, non-exclusive, royalty-free license to
                use, modify, distribute, and sublicense your contributions under
                the MIT License.
              </p>
              <p className="mt-4">
                You represent that you have the right to grant such license and
                that your contributions do not infringe upon any third-party
                rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                13. Modifications to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify you of any material changes by posting the updated Terms
                on this page and updating the &quot;Last updated&quot; date.
              </p>
              <p className="mt-4">
                Your continued use of the Software after any changes to these
                Terms constitutes your acceptance of such changes. If you do not
                agree to the modified Terms, you must stop using the Software
                and uninstall it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                14. Governing Law and Dispute Resolution
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the jurisdiction in which the Software is
                primarily maintained, without regard to its conflict of law
                provisions.
              </p>
              <p className="mt-4">
                Any disputes arising out of or relating to these Terms or the
                Software shall be resolved through binding arbitration in
                accordance with the rules of a recognized arbitration
                organization, except where prohibited by law. You waive any
                right to participate in a class-action lawsuit or class-wide
                arbitration.
              </p>
              <p className="mt-4">
                If arbitration is not permitted by law, any legal action or
                proceeding arising under these Terms will be brought exclusively
                in the courts of the jurisdiction in which the Software is
                primarily maintained.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                15. Severability
              </h2>
              <p>
                If any provision of these Terms is found to be unenforceable or
                invalid, that provision shall be limited or eliminated to the
                minimum extent necessary so that these Terms shall otherwise
                remain in full force and effect and enforceable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                16. Entire Agreement
              </h2>
              <p>
                These Terms, together with the MIT License, constitute the
                entire agreement between you and us regarding the use of the
                Software and supersede all prior or contemporaneous
                communications, proposals, and agreements, whether oral or
                written.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">17. Waiver</h2>
              <p>
                No waiver of any term or condition of these Terms shall be
                deemed a further or continuing waiver of such term or condition
                or any other term or condition, and any failure to assert a
                right or provision under these Terms shall not constitute a
                waiver of such right or provision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 mt-8">
                18. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
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
                  BY USING DICTA, YOU ACKNOWLEDGE THAT YOU HAVE READ,
                  UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
                  IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE
                  SOFTWARE.
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
