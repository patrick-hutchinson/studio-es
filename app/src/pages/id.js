import styles from "@/styles/pages/Id.module.css";

import Text from "@/components/Text/Text";

export default function Id() {
  return (
    <div className={`page ${styles.page}`}>
      <main className="main">
        <div className={`${styles.idPage} content grid`}>
          <div className={styles.aboutText} typo="h3">
            <div className={styles.aboutTextInner}>
              The Studio Studio Es is an independent design practice based in Vienna, creating visual identities,
              publications, and digital experiences for institutions across culture, architecture, film, science, art, and
              education. Through a research-driven and content-focused approach, the studio creates flexible communication
              systems that connect typography, narrative, and technology across print and digital media. Since its founding,
              the studio has collaborated with cultural institutions, universities, architecture practices, publishers,
              festivals, research initiatives, and artists. Selected collaborations include the Austrian Directors
              Association, GRAFT, Taubman College at the University of Michigan, Museum der bildenden Künste Leipzig,
              NRW-Forum Düsseldorf, knowbotiq, Goethe-Institut, Diagonale – Festival of Austrian Film, Initiative
              Urheberrecht, AllesWirdGut Architektur, and the Vienna Symphony Orchestra. Over the years, the studio’s work
              has received international recognition and has been presented through exhibitions, conferences, workshops, and
              design festivals. Selected engagements include teaching appointments, lectures, guest critiques, and jury
              participation at ECAL Lausanne, Bauhaus-Universität Weimar, Karlsruhe University of Arts and Design (HfG), the
              Taipei Design Award, Cannes Lions, ADC*E, and the Design Summer Academy Hangzhou. The studio’s output has been
              featured in exhibitions and festivals including the Brno Biennial of Graphic Design and Vienna Design Week, and
              has received numerous awards and distinctions, including the European Design Awards, D&AD, the Type Directors
              Club New York (TDC), ADC New York, 100 Beste Plakate, and the Antwerp Poster Festival, among others. Studio Es
              is led by AGI member Verena Panholzer. Alongside her design practice, she maintains an active engagement with
              teaching, research, and international design discourse. She currently teaches Typography and Human Interaction
              Design within the Narrative Media and Transmedia Art program at the University of Applied Arts Vienna and has
              held visiting professorships at the State Academy of Fine Arts Stuttgart and the University of Arts Linz.
              Employment and Internships We do not currently have any vacancies. Studio Space A 70 m² apartment studio is
              available for designers seeking part-time use. Instagram No updates Upcoming APERN – What Emerges: Visual
              Identity, 2027 The Kurious Magazine No. 2, 2026 P.IN.E.A 002, Fall/Winter, 2026 Talk at Schloss Hollenegg, June
              25–26, 2026 Commissions and General Enquiries info@studio-es.at.
            </div>
          </div>
          <Text text="Hier auch ein Custom text." className={styles.callToAction} typo="h3 compensate" />
          <div className={styles.copyright} typo="h3 compensate">
            Hier der selbe copyright text?
          </div>
        </div>
      </main>
    </div>
  );
}
