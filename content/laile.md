# Laile (莱乐): camera-verified home physical therapy

Laile was built for the Tencent Cloud AI CAN DO IT Hackathon Singapore 2026, Healthcare Track (NTU LKC Medicine), challenge "AI Healthier Every Day: Intelligent Support for Long-Term Self-Care". It has an iPhone app (Swift), a web app, and a clinician portal.

The problem: home exercise is where physical therapy succeeds or fails, and adherence is poor. People skip sessions or do them with bad form, and self-reported logs can't tell the difference. Physios only see the patient at the next visit.

What it does:

- The camera verifies. Pose estimation (MediaPipe on the web) counts reps, times holds and measures knee bend and arm lift, so the record can't be faked.
- Programs are the unit: a physio's program, a plan the coach builds from your goals, or a calisthenics or mobility program. Each starts with a camera check-in that sets personal targets.
- The coach, Lele, takes initiative: morning check-ins, medicine reminders, nudges on quiet days, and it remembers what was sore so that exercise gets easier next time. You can chat or talk to it.
- Planning in chat: Lele drafts a program from a knowledge base using only a vetted exercise library (on Tencent Cloud ADP). For a physio's patient, the physio approves it first.
- The physio stays in charge: they sign programs, can watch a session live, and get a daily list of what Lele noticed.
- Code decides, the model talks: safety limits and program changes are deterministic rules; the LLM explains, encourages, drafts and summarises.

Conditions covered first: knee and hip replacement, knee pain, and stiff or painful shoulder.

Code: https://github.com/LimCharles/laile
