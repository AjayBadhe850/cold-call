import { ColdCallStageDefinition } from './types';

/**
 * 8-Stage Cold-Call Sales Methodology Data
 * Modular, editable, and structured so adjustments can be made easily.
 * Based on proven B2B outbound frameworks (Pattern Interrupt, Problem Discovery,
 * Impact Quantification, Baseline Qualification, Friction Handling, and Collaborative Close).
 */
export const COLD_CALL_STAGES: ColdCallStageDefinition[] = [
  {
    stageNumber: 1,
    name: "Opener & Pattern Interrupt",
    title: "Stage 1: Opener & Pattern Interrupt",
    tagline: "Break defensive reflex and earn the first 30 seconds",
    purpose: "Cold prospects immediately categorize callers into 'annoying telemarketer' or 'peer with a legitimate reason'. A polite pattern interrupt disarms defensiveness and secures conversational permission.",
    callerObjective: "Acknowledge the interruption respectfully, state your name and company cleanly, and secure permission for 20-30 seconds of their attention.",
    talkingPoints: [
      "Hi {{prospect_name}}, this is {{caller_name}} with ColdCall Copilot. I know I'm catching you unannounced—do you have 30 seconds for me to tell you why I called, and then you can tell me if it's worth keeping talking?",
      "Good morning {{prospect_name}}, I know you weren't expecting my call today. Can I take 20 seconds to share what prompted me to reach out to {{company_name}}?",
      "Hey {{prospect_name}}, I'll be completely upfront—this is a cold call. You can hang up now, or give me 30 seconds to explain why this might help your sales team?"
    ],
    exampleProspectResponses: [
      "Sure, I've got 30 seconds. What do you have?",
      "Who is this and what company are you with?",
      "I'm actually walking into a meeting right now, what is this regarding?",
      "Not interested, take me off your list."
    ],
    objections: [
      {
        objection: "I'm extremely busy right now.",
        suggestedResponse: "Completely understand, you weren't expecting my call. Would tomorrow morning at 9:30 AM or Thursday at 2 PM be better for a 2-minute catch-up?",
        tip: "Acknowledge immediately. Offer two distinct time slots instead of asking open-ended 'when'."
      },
      {
        objection: "Is this a sales pitch?",
        suggestedResponse: "It is! But before selling you anything, I just wanted to see if reducing live call objection drop-off is even on your radar this quarter.",
        tip: "Disarm them with honest humor. Don't hide that it's a sales call."
      },
      {
        objection: "How did you get my direct phone number?",
        suggestedResponse: "I was researching leaders heading outbound teams at {{company_name}} on LinkedIn, and our sales intelligence tool verified this as your direct desk line.",
        tip: "Be transparent and confident. Never stumble on data provenance."
      }
    ],
    outcomes: [
      {
        value: "permission_granted",
        label: "Permission Granted (Advance)",
        description: "Prospect agreed to hear the reason for the call.",
        recommendedNextStage: 2,
        isSuccessPath: true
      },
      {
        value: "hesitant_listening",
        label: "Hurried / Skeptical (Fast Hook Needed)",
        description: "Prospect is listening but warned they have very little time.",
        recommendedNextStage: 2,
        isSuccessPath: true
      },
      {
        value: "callback_requested",
        label: "Busy / Callback Requested",
        description: "Prospect is genuinely in transit or meeting; asked to call later.",
        terminatesCall: true,
        recommendedNextStage: 1
      },
      {
        value: "gatekeeper_or_wrong_person",
        label: "Wrong Person / Gatekeeper",
        description: "Reached assistant or person who does not handle this area.",
        terminatesCall: true,
        recommendedNextStage: 1
      },
      {
        value: "immediate_hangup",
        label: "Immediate Hangup / Hostile",
        description: "Prospect hung up or adamantly refused to engage.",
        terminatesCall: true
      }
    ],
    defaultNextStage: 2
  },
  {
    stageNumber: 2,
    name: "Reason for Call & Context Hook",
    title: "Stage 2: Reason for Call & Context Hook",
    tagline: "Deliver an undeniable trigger or relevant peer benchmark",
    purpose: "Prospects listen only if they believe you understand their role and current context. Generic pitches fail; a targeted trigger or peer benchmark earns sustained interest.",
    callerObjective: "Deliver a crisp 15-second contextual reason why you called them specifically today, referencing a recognizable peer challenge.",
    talkingPoints: [
      "The reason I called is we've been working with several VP of Sales in B2B tech who noticed that newer reps lose 40% of warm prospects in the first 60 seconds because of unexpected objections.",
      "I noticed on LinkedIn that {{company_name}} is scaling its outbound SDR pod this quarter. Typically when teams grow that fast, conversation ramp time becomes the primary pipeline bottleneck.",
      "We recently helped a sales org similar to yours boost their live-call connect-to-meeting rate by 32% without adding headcount or expensive training courses."
    ],
    exampleProspectResponses: [
      "Yeah, rep ramp time is definitely something we've been struggling with lately.",
      "We already have tools like Gong and Outreach for our reps.",
      "How is this different from standard sales scripts?",
      "Just send me an email with some collateral."
    ],
    objections: [
      {
        objection: "We already have an existing tool / vendor for that.",
        suggestedResponse: "Most of our customers already have Gong or Outreach too. Those tools analyze calls after the fact; we provide live, on-screen guidance during the call so reps don't lose the deal in the moment.",
        tip: "Position as a complementary real-time layer, not a rip-and-replace."
      },
      {
        objection: "Send me an email first.",
        suggestedResponse: "I'd love to send an email! So I don't send you generic marketing fluff, what's the single biggest friction point your reps face when handling objections today?",
        tip: "Agree to send the email, then immediately use it as a pivot into discovery."
      }
    ],
    outcomes: [
      {
        value: "hook_engaged",
        label: "Hook Resonated (Advance to Discovery)",
        description: "Prospect acknowledged the trigger or shared challenge.",
        recommendedNextStage: 3,
        isSuccessPath: true
      },
      {
        value: "curious_question",
        label: "Asked Clarifying Question",
        description: "Prospect asked how it works or how it relates to them.",
        recommendedNextStage: 3,
        isSuccessPath: true
      },
      {
        value: "deflected_send_email",
        label: "Deflected / 'Send Me An Email'",
        description: "Prospect attempted quick deflection; pivot to discovery or objection handling.",
        recommendedNextStage: 6
      },
      {
        value: "no_relevance",
        label: "Not Relevant / Out of Scope",
        description: "Prospect confirmed they do not do cold calling or outbound.",
        terminatesCall: true
      }
    ],
    defaultNextStage: 3
  },
  {
    stageNumber: 3,
    name: "Problem Hypothesis & Discovery",
    title: "Stage 3: Problem Hypothesis & Discovery",
    tagline: "Test the pain hypothesis and let the prospect speak",
    purpose: "Selling before discovering the prospect's actual pain leads to premature rejection. You must diagnose their current situation and listen 70% of the time.",
    callerObjective: "Ask one targeted, open-ended diagnostic question and let the prospect explain their reality. Take careful notes on their exact terminology.",
    talkingPoints: [
      "When your reps are on live outbound dials and get hit with unexpected resistance, how do they currently adapt in real time?",
      "How are you currently preventing pipeline leakage during the first 2 minutes of cold calls?",
      "If you could fix one thing about how your team conducts discovery during cold calls, what would make the biggest revenue impact?"
    ],
    exampleProspectResponses: [
      "Honestly, our senior reps do fine, but our newer SDRs freeze when prospects push back.",
      "We give them PDF cheat sheets and playbooks, but nobody looks at them while on a call.",
      "Everything is working pretty smoothly for us right now, to be honest.",
      "We rely on our weekly coaching sessions to review recorded calls."
    ],
    objections: [
      {
        objection: "We don't really have that problem; our conversion is fine.",
        suggestedResponse: "That's awesome to hear—few sales leaders can say that! If you're hitting your numbers, that's great. May I ask what benchmark conversion rate your team is currently seeing from dial to meeting?",
        tip: "Praise their success, then gently ask for the metric that reveals the truth."
      },
      {
        objection: "I'm not the right person to discuss this with.",
        suggestedResponse: "Got it! Who on your team oversees outbound enablement and rep pipeline targets? Would that be your Sales Enablement Director or VP of Sales?",
        tip: "Ask for a specific title to make the referral easy."
      }
    ],
    outcomes: [
      {
        value: "core_pain_confirmed",
        label: "Core Pain Confirmed (Advance to Value Prop)",
        description: "Prospect clearly stated a pain point matching our solution.",
        recommendedNextStage: 4,
        isSuccessPath: true
      },
      {
        value: "secondary_pain_surfaced",
        label: "Secondary Pain Surfaced",
        description: "Prospect highlighted an adjacent problem (e.g., onboarding time).",
        recommendedNextStage: 4,
        isSuccessPath: true
      },
      {
        value: "denies_pain",
        label: "Denies Pain / Satisfied Status Quo",
        description: "Prospect claims current process is completely adequate.",
        recommendedNextStage: 6
      },
      {
        value: "referred_to_colleague",
        label: "Referred to Another Decision Maker",
        description: "Prospect provided the name/contact of the correct person.",
        terminatesCall: true
      }
    ],
    defaultNextStage: 4
  },
  {
    stageNumber: 4,
    name: "Value Proposition & Business Impact",
    title: "Stage 4: Value Proposition & Business Impact",
    tagline: "Map solution directly to their pain with quantified ROI",
    purpose: "Features tell, but quantified business outcomes sell. Frame the value in terms of revenue unlocked, ramp-time shortened, or quota attainment achieved.",
    callerObjective: "Deliver a 2-sentence value statement directly linked to the pain they just admitted, showing measurable business impact.",
    talkingPoints: [
      "That's exactly why we built ColdCall Copilot. It's a live in-call dashboard that surfaces the exact objection counter and recommended next step in under 2 seconds. Outbound teams using it see a 35% jump in booked meetings within 30 days.",
      "Instead of forcing reps to memorize 50-page battlecards, the copilot gives them stage-by-stage intelligence right beside their dialer, cutting ramp time from 4 months down to 3 weeks.",
      "What our clients love is that it doesn't require complex integration—reps keep it open during calls and immediately sound like 5-year top performers."
    ],
    exampleProspectResponses: [
      "That sounds pretty clever. How does the AI actually know what to recommend?",
      "Does it listen to the prospect's voice or do reps type?",
      "Sounds expensive. We've cut back on software budgets this year.",
      "How long does it take to implement?"
    ],
    objections: [
      {
        objection: "We don't have budget for new software right now.",
        suggestedResponse: "Completely fair. I'm definitely not asking you to buy anything today. Right now we're just seeing if there's enough potential ROI to warrant a look when your next budget window opens.",
        tip: "Remove all immediate sales pressure. Focus purely on evaluating mutual fit."
      },
      {
        objection: "Our reps don't like clunky software that slows them down.",
        suggestedResponse: "That's our entire design philosophy—it was built by reps who hated complicated tools. It takes zero clicks to see the next move, and reps can use it on day one without IT setup.",
        tip: "Emphasize extreme simplicity and non-intrusive design."
      }
    ],
    outcomes: [
      {
        value: "high_interest",
        label: "High Interest / Asked for Details",
        description: "Prospect asked about workflow, features, or trial.",
        recommendedNextStage: 5,
        isSuccessPath: true
      },
      {
        value: "cautious_interest",
        label: "Cautious Interest / Price Sensitive",
        description: "Interested in the concept but concerned about cost or adoption.",
        recommendedNextStage: 5,
        isSuccessPath: true
      },
      {
        value: "skeptical_relevance",
        label: "Skeptical / Pushback on Need",
        description: "Doubtful that live guidance makes a difference.",
        recommendedNextStage: 6
      }
    ],
    defaultNextStage: 5
  },
  {
    stageNumber: 5,
    name: "Qualification & Baseline Check",
    title: "Stage 5: Qualification & Baseline Check",
    tagline: "Confirm team size, authority, and alignment with ICP",
    purpose: "Do not waste time booking meetings with unqualified prospects who have no budget, no authority, or an incompatible team size.",
    callerObjective: "Ask 2 quick qualification questions to verify fit (number of outbound reps, timeline, decision process) in a collaborative tone.",
    talkingPoints: [
      "Just to ensure this would genuinely move the needle for you—roughly how many reps on your team make outbound dials each week?",
      "Are you folks evaluating tools to improve conversation conversion this quarter, or is this more of a next-quarter exploratory initiative?",
      "When your team evaluates new sales productivity software, what does that decision process typically look like?"
    ],
    exampleProspectResponses: [
      "We have about 14 SDRs and 8 Account Executives doing cold outreach.",
      "We're only a team of 2 founders doing outbound right now.",
      "I'm the VP of Sales, so if I like it, we run a trial with 3 reps.",
      "We would need security review and procurement signoff."
    ],
    objections: [
      {
        objection: "Why do you need to know our team size and budget?",
        suggestedResponse: "Because our workflow is tailored for active outbound pods. If your team is under 3 reps, our self-serve guide is usually better; if you're 5+ reps, the team copilot drives dramatic pipeline lift.",
        tip: "Explain the reason behind qualification questions so they feel served, not interrogated."
      }
    ],
    outcomes: [
      {
        value: "ideal_customer_fit",
        label: "Strong ICP Match (5+ Reps, Active Outbound)",
        description: "Prospect qualifies with ideal team size and active outbound focus.",
        recommendedNextStage: 7,
        isSuccessPath: true
      },
      {
        value: "moderate_fit",
        label: "Moderate Fit / Smaller Team",
        description: "Fits profile but smaller team or longer timeline.",
        recommendedNextStage: 7,
        isSuccessPath: true
      },
      {
        value: "unqualified_too_small",
        label: "Unqualified / Incompatible ICP",
        description: "Team too small or no outbound dialing planned.",
        terminatesCall: true
      },
      {
        value: "needs_multi_stakeholder",
        label: "Needs Multi-Stakeholder Approval",
        description: "User is interested but needs to involve peers or director.",
        recommendedNextStage: 6
      }
    ],
    defaultNextStage: 7
  },
  {
    stageNumber: 6,
    name: "Objection Handling & Clarification",
    title: "Stage 6: Objection Handling & Clarification",
    tagline: "Isolate underlying friction and reframe to low-risk exploration",
    purpose: "An objection is often an unspoken request for reassurance. Validate the objection, isolate the root concern, and reframe toward a zero-risk 15-minute evaluation.",
    callerObjective: "Acknowledge the prospect's concern with empathy, isolate whether there are other hidden concerns, and propose a low-friction compromise.",
    talkingPoints: [
      "I completely respect that you're focused on existing priorities right now. Usually when sales leaders hesitate, it's because they've been burned by heavy implementations. If we could show you a 3x lift with zero IT burden, would you be open to a 10-minute look?",
      "It sounds like your calendar is overflowing this week. What if we penciled in 15 minutes for 3 weeks out, and I'll send an agenda beforehand so you can cancel if it's no longer relevant?",
      "You mentioned needing to talk to your director first. How about we do a brief 15-minute walkthrough where you can invite them, so neither of you has to guess how it works?"
    ],
    exampleProspectResponses: [
      "Alright, that makes sense. But I really can only give you 15 minutes max.",
      "I'm willing to look at it if you can show me hard numbers for B2B SaaS.",
      "I still think we're too busy right now, check back in Q4.",
      "No thanks, we're really not interested."
    ],
    objections: [
      {
        objection: "Just send me information and I'll reach out if interested.",
        suggestedResponse: "I will definitely send info over. The challenge with one-pagers is they can't show the real-time AI in action. Let's do a 10-minute screen share—if you don't see immediate value, you can tell me no and I won't follow up again.",
        tip: "Give them complete permission to say 'no'. It lowers their resistance instantly."
      },
      {
        objection: "We don't do demos without knowing pricing.",
        suggestedResponse: "Pricing is transparent: it starts at $49/rep/month. In the 15-minute call, we can confirm the exact tier for your team size so you have complete visibility before spending any time.",
        tip: "Share a ballpark range transparently to eliminate the pricing barrier."
      }
    ],
    outcomes: [
      {
        value: "objection_resolved",
        label: "Objection Overcome (Advance to Meeting Ask)",
        description: "Prospect is receptive and agreed to discuss next steps.",
        recommendedNextStage: 7,
        isSuccessPath: true
      },
      {
        value: "compromise_low_commitment",
        label: "Agreed to Low-Commitment Step",
        description: "Prospect agreed to a quick 10-minute introductory look.",
        recommendedNextStage: 7,
        isSuccessPath: true
      },
      {
        value: "firm_rejection",
        label: "Firm Rejection / Hard 'No'",
        description: "Prospect reiterated an unequivocal refusal.",
        terminatesCall: true
      },
      {
        value: "nurture_future_quarter",
        label: "Nurture / Check Back in 3 Months",
        description: "Timing is genuinely impossible right now; set calendar reminder.",
        terminatesCall: true
      }
    ],
    defaultNextStage: 7
  },
  {
    stageNumber: 7,
    name: "The Ask / Call-to-Action",
    title: "Stage 7: The Ask / Call-to-Action (Meeting Request)",
    tagline: "Lock in a specific, time-boxed next step with two calendar options",
    purpose: "Never end a successful cold call with 'I'll email you.' Lock in a specific calendar appointment while you have their attention.",
    callerObjective: "Ask for a 15-minute discovery session with an assertive, collaborative tone and offer two specific calendar slots.",
    talkingPoints: [
      "I know your calendar is packed, so I don't want to take any more of your day. How does your Tuesday look around 10:00 AM or Wednesday afternoon at 2:30 PM for a quick 15-minute screen share?",
      "Let's do this: let's carve out 15 minutes next week. If it looks like a fit, great. If not, you can tell me no and we'll part as friends. Does next Tuesday morning work?",
      "Would Thursday morning at 11:00 AM or Friday at 3:00 PM work better for your calendar?"
    ],
    exampleProspectResponses: [
      "Tuesday at 10:00 AM works. Send me a calendar invite.",
      "Wednesday afternoon is better for me.",
      "Can we do next week Friday?",
      "I can't commit to a time right now. Send me an invite link."
    ],
    objections: [
      {
        objection: "Can't you just send me a recorded demo instead?",
        suggestedResponse: "I could, but a recorded video won't let you see your specific cold-call scripts live in the engine. A 12-minute personalized walkthrough will save you an hour of research. How does Tuesday morning look?",
        tip: "Emphasize customization and time savings over generic recordings."
      }
    ],
    outcomes: [
      {
        value: "meeting_agreed",
        label: "Meeting Date & Time Agreed (Advance to Wrap-up)",
        description: "Prospect agreed to a specific calendar slot.",
        recommendedNextStage: 8,
        isSuccessPath: true
      },
      {
        value: "tentative_meeting",
        label: "Tentative / Send Calendar Hold",
        description: "Agreed in principle; requested a placeholder invite to confirm.",
        recommendedNextStage: 8,
        isSuccessPath: true
      },
      {
        value: "declined_meeting_request",
        label: "Declined Meeting / Requested Self-Serve Info",
        description: "Prospect refused meeting but asked for direct documentation.",
        terminatesCall: true
      }
    ],
    defaultNextStage: 8
  },
  {
    stageNumber: 8,
    name: "Wrap-up & Confirmation",
    title: "Stage 8: Wrap-up & Confirmation",
    tagline: "Verify email details, set clear agenda, and end on high energy",
    purpose: "No-show rates on cold-call meetings can exceed 40% if the wrap-up is sloppy. Confirming the email address, spelling, and sending the invite while on the phone locks in attendance.",
    callerObjective: "Confirm email address, mention who else should be invited, send the calendar invite, and close warmly.",
    talkingPoints: [
      "Fantastic. I have your email as {{prospect_email}}—I am sending the calendar invite for Tuesday at 10:00 AM right now with the agenda attached. Should I include anyone else from your team?",
      "Great! The invite is in your inbox now from {{caller_name}}. Could you quickly verify you received it so it doesn't get caught in spam?",
      "Thank you so much for your time today, {{prospect_name}}. Looking forward to our conversation on Tuesday. Have a great rest of your week!"
    ],
    exampleProspectResponses: [
      "Got the invite, just hit accept.",
      "Yes, please add Sarah from our enablement team: sarah@company.com.",
      "Looks good, talk to you next Tuesday.",
      "Thanks, bye."
    ],
    objections: [
      {
        objection: "What if something urgent comes up?",
        suggestedResponse: "Totally understand, things happen! The invite has a direct one-click reschedule link, or you can just reply directly to the invite and we'll adapt.",
        tip: "Give them a guilt-free rescheduling mechanism so they don't ghost."
      }
    ],
    outcomes: [
      {
        value: "call_completed_meeting_booked",
        label: "Call Completed: Meeting Booked & Accepted",
        description: "Calendar invite sent and accepted. High pipeline value.",
        terminatesCall: true,
        isSuccessPath: true
      },
      {
        value: "call_completed_invite_sent",
        label: "Call Completed: Invite Sent (Pending Acceptance)",
        description: "Invite dispatched; follow-up reminder scheduled.",
        terminatesCall: true,
        isSuccessPath: true
      },
      {
        value: "call_completed_followup_needed",
        label: "Call Completed: Additional Follow-up Info Required",
        description: "Follow-up notes and collateral required before meeting.",
        terminatesCall: true
      }
    ],
    defaultNextStage: 8
  }
];

export function getStageByNumber(stageNumber: number): ColdCallStageDefinition {
  const stage = COLD_CALL_STAGES.find(s => s.stageNumber === stageNumber);
  if (!stage) {
    return COLD_CALL_STAGES[0];
  }
  return stage;
}
