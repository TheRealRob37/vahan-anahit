// Wedding Invitation Page - Main page displaying all wedding details and RSVP form
import HeroSection from '../components/HeroSection'
import InvitationTextSection from '../components/InvitationTextSection'
import CalendarSection from '../components/CalendarSection'
import GuestPresenceSection from '../components/GuestPresenceSection'
import ProgramSection from '../components/ProgramSection'
import DressCodeAndRulesSection from '../components/DressCodeAndRulesSection'
import DateRecapSection from '../components/DateRecapSection'
import RSVPSection from '../components/RSVPSection'
import ThankYouSection from '../components/ThankYouSection'
import FooterSection from '../components/FooterSection'

export default function InvitationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0ea' }}>
      <HeroSection />
      <InvitationTextSection />
      <CalendarSection />
      <GuestPresenceSection />
      <ProgramSection />
      <DressCodeAndRulesSection />
      <DateRecapSection />
      <RSVPSection />
      <ThankYouSection />
      <FooterSection />
    </div>
  )
}
