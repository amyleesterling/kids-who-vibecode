import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'

const effectiveDate = 'July 14, 2026'

function LegalPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Terms, Safety & Privacy — Vibe Code Club'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="legal-page">
      <header className="legal-header page-shell">
        <a className="logo" href="/" aria-label="Vibe Code Club home">
          <span className="logo-mark"><span /> <span /> <span /></span>
          <span>VIBE CODE<br /><b>CLUB</b></span>
        </a>
        <a className="button button-light legal-back" href="/"><ArrowLeft size={17} /> Back to the clubhouse</a>
      </header>

      <main>
        <section className="legal-hero">
          <div className="page-shell legal-hero-inner">
            <div>
              <span className="kicker">For grown-ups</span>
              <h1>Terms, Safety<br />& Privacy</h1>
              <p>Vibe Code Club is a playful showcase for kid-led coding projects. Adults stay responsible for supervising children, reviewing projects and links, and deciding what is appropriate for their family.</p>
            </div>
            <aside className="legal-callout"><ShieldCheck size={34} /><div><b>Grown-up supervision is required.</b><p>Children should not submit anything, open community projects, or follow external links without a parent or guardian present.</p></div></aside>
          </div>
        </section>

        <div className="page-shell legal-layout">
          <nav className="legal-nav" aria-label="Legal page sections">
            <span>On this page</span>
            <a href="#terms">Terms of use</a>
            <a href="#content">Community content</a>
            <a href="#safety">Safety rules</a>
            <a href="#disclaimers">Disclaimers</a>
            <a href="#privacy">Privacy notice</a>
            <a href="#parents">Parent choices</a>
            <a href="#contact">Contact</a>
          </nav>

          <article className="legal-copy">
            <p className="legal-date"><b>Effective and last updated:</b> {effectiveDate}</p>
            <p className="legal-intro">Please read this page before an adult uses Vibe Code Club with a child. “Vibe Code Club,” “Vibe Code Kids,” “we,” and “us” refer to the operator of vibecodekids.com. By accessing the site, an adult agrees to these terms for themselves and accepts responsibility for any child they supervise. A child may not accept these terms or submit content on their own.</p>

            <section id="terms">
              <span className="legal-number">01</span>
              <h2>Purpose and adult responsibility</h2>
              <p>The site is a free, recreational community where children can respond to creative coding prompts and families can share kid-led projects. It is not a school, childcare service, professional service, or substitute for a parent’s judgment.</p>
              <ul>
                <li>An adult must supervise a child’s use of this site and every linked project.</li>
                <li>Only an adult may submit a project, challenge idea, image, contact information, or newsletter signup.</li>
                <li>The supervising adult decides whether any prompt, project, code repository, playable experience, or external service is suitable for their child.</li>
                <li>If an experience seems upsetting, unsafe, broken, or inappropriate, close it and tell us so we can review the link.</li>
              </ul>
            </section>

            <section id="content">
              <span className="legal-number">02</span>
              <h2>Community projects and external links</h2>
              <p>Projects are created by children and families, not by Vibe Code Club. Our review is a good-faith safety check, not an endorsement, certification, or guarantee. We do not control third-party repositories, hosting services, games, websites, downloads, advertisements, or privacy practices, and they may change after we review them.</p>
              <p>Open external projects only with adult supervision. Do not download files, run code, grant device permissions, create accounts, make purchases, or provide personal information unless the supervising adult independently decides it is safe.</p>
              <h3>What submitters promise</h3>
              <p>The adult submitting content confirms that they have authority to submit it; the child led the project; the submission does not violate another person’s privacy, copyright, trademark, or other rights; and all public information is appropriate to share.</p>
              <p>The submitter keeps ownership of their content and gives us a non-exclusive, worldwide, royalty-free license to host, copy, resize, format, display, and promote the submitted project materials for operating and sharing Vibe Code Club. This license ends when we delete the content, except for reasonable technical backups and material already shared with the submitter’s permission.</p>
            </section>

            <section id="safety">
              <span className="legal-number">03</span>
              <h2>Safety and acceptable use</h2>
              <p>Do not submit full names, faces, voices, school names, addresses, precise locations, phone numbers, personal email addresses belonging to children, account credentials, or other information that could identify or contact a child. Use a nickname and project screenshots or artwork instead.</p>
              <p>Do not submit or link to harassment, hate, sexual content, graphic violence, self-harm content, dangerous instructions, malware, deceptive downloads, unlawful material, unauthorized copyrighted material, or any attempt to contact or identify a child. Do not manipulate voting, probe the service, bypass moderation, or interfere with the site.</p>
              <p>We may reject, hide, remove, or preserve content and records when we reasonably believe it is unsafe, unlawful, violates these terms, or is needed to protect the community. We may suspend features or the site at any time.</p>
            </section>

            <section id="disclaimers">
              <span className="legal-number">04</span>
              <h2>Disclaimers and limits</h2>
              <div className="legal-warning">
                <b>The site and all community content are provided “as is” and “as available.”</b>
                <p>To the fullest extent permitted by law, we disclaim all express and implied warranties, including warranties of accuracy, safety, suitability, availability, non-infringement, merchantability, fitness for a particular purpose, and that content will be free from errors, harmful code, or upsetting material.</p>
              </div>
              <p>To the fullest extent permitted by law, Vibe Code Club and its operator will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages; loss of data or device access; exposure to third-party content; interactions with external services; or harm arising from a project, link, download, code, or a family’s use of the site.</p>
              <p>Where liability cannot legally be excluded, our total liability for claims related to the site will not exceed the greater of US $100 or the amount the claimant paid us to use the site during the prior twelve months. Because the site is free, that amount will ordinarily be $100. Some jurisdictions do not allow certain exclusions, so these limits apply only to the extent allowed by law. Nothing here excludes liability that cannot legally be excluded.</p>
              <p>An adult submitter is responsible for their submission and, to the extent permitted by law, agrees to reimburse us for third-party claims and reasonable costs caused by content they had no right to submit or by their intentional violation of these terms.</p>
            </section>

            <section id="privacy">
              <span className="legal-number">05</span>
              <h2>Privacy notice</h2>
              <h3>What we collect</h3>
              <ul>
                <li><b>Public project information:</b> a child’s nickname, age group, project title and description, approved image, project links, and favorite totals.</li>
                <li><b>Private grown-up information:</b> parent or guardian name and email, permissions and attestations, challenge-idea contact email, and newsletter email.</li>
                <li><b>Basic technical information:</b> a random browser voting identifier stored on the device, server request information used for security and reliability, and an admin session cookie used only for the private clubhouse.</li>
              </ul>
              <p>We use this information to review and display approved projects, operate one-vote-per-browser favorites, communicate with adults, send requested weekly emails, maintain safety, prevent abuse, and operate the service. We do not sell personal information or use behavioral advertising.</p>
              <h3>Who receives information</h3>
              <p>Approved public fields are visible to anyone. Private information is available only to authorized club administrators and service providers that help us host the site, store data and images, protect the service, or deliver requested email. These providers may process information only to provide those services. External project links have their own privacy practices.</p>
              <h3>How long we keep it</h3>
              <p>We keep submissions, moderation records, votes, and adult contact information only as long as reasonably needed to run the club, document permissions, address safety or legal issues, and meet legal obligations. Newsletter addresses remain until unsubscribed. Limited copies may remain temporarily in protected backups.</p>
              <h3>Children’s privacy</h3>
              <p>We design submissions to be completed and approved by adults. Children should never send us contact information or identifying details. A parent or guardian may ask to review, correct, remove, or stop further collection of their child’s information by contacting us. We may need to verify that the requester is the child’s parent or guardian before acting.</p>
            </section>

            <section id="parents">
              <span className="legal-number">06</span>
              <h2>Parent and guardian choices</h2>
              <p>A parent or guardian can ask us to remove a project, delete private submission information, correct public information, stop using a child’s information, or identify the information associated with their submission. Include the public nickname and project title, but do not email additional sensitive information. We may retain limited records where reasonably necessary for security, disputes, legal compliance, or documenting consent.</p>
              <p>Newsletter subscribers can use the unsubscribe link in every email. Removing a project from our gallery does not remove copies controlled by GitHub, a project host, or another external service; the adult must contact those services separately.</p>
            </section>

            <section id="contact">
              <span className="legal-number">07</span>
              <h2>Reports, legal notices, and contact</h2>
              <p>Report unsafe content, a privacy concern, a copyright concern, or a removal request to <a href="mailto:hello@vibecodekids.com">hello@vibecodekids.com</a>. Include the project title, link, the nature of the concern, and how we can contact the adult making the report.</p>
              <p>We may update these terms as the club changes. The date at the top shows the current version. Material changes will apply going forward and may require a new adult acceptance for future submissions.</p>
              <a className="legal-ftc-link" href="https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy" target="_blank" rel="noreferrer">U.S. FTC children’s privacy resources <ExternalLink size={15} /></a>
            </section>
          </article>
        </div>
      </main>

      <footer className="legal-footer"><div className="page-shell"><p>Made for small coders with big ideas—and grown-ups close by.</p><a href="/">Return to vibecodekids.com</a></div></footer>
    </div>
  )
}

export default LegalPage
