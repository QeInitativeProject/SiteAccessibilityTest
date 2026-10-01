# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Axe_Core_Test.spec.ts >> example accessibility test
- Location: src\test\TestScript\Axe_Core_Test.spec.ts:5:5

# Error details

```
Error: Found 6 accessibility violation(s)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 62

- Array []
+ Array [
+   Object {
+     "description": "Ensure elements with an ARIA role that require child roles contain them",
+     "id": "aria-required-children",
+     "impact": "critical",
+     "nodesCount": 1,
+     "selectors": Array [
+       ".carousel-tabs-list",
+     ],
+   },
+   Object {
+     "description": "Ensure elements with an ARIA role that require parent roles are contained by them",
+     "id": "aria-required-parent",
+     "impact": "critical",
+     "nodesCount": 3,
+     "selectors": Array [
+       "#tab-0",
+       "#tab-1",
+       "#tab-2",
+     ],
+   },
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodesCount": 3,
+     "selectors": Array [
+       ".google-review__score",
+       ".google-review__count",
+       "b > a",
+     ],
+   },
+   Object {
+     "description": "Ensure links are distinguished from surrounding text in a way that does not rely on color",
+     "id": "link-in-text-block",
+     "impact": "serious",
+     "nodesCount": 1,
+     "selectors": Array [
+       "a[title=\"NASM in Action\"]",
+     ],
+   },
+   Object {
+     "description": "Ensure links have discernible text",
+     "id": "link-name",
+     "impact": "serious",
+     "nodesCount": 1,
+     "selectors": Array [
+       ".desktop-nav__logo > a[href=\"/\"]",
+     ],
+   },
+   Object {
+     "description": "Ensure <li> elements are used semantically",
+     "id": "listitem",
+     "impact": "serious",
+     "nodesCount": 3,
+     "selectors": Array [
+       ".carousel-tab-item:nth-child(1)",
+       ".carousel-tab-item:nth-child(2)",
+       ".carousel-tab-item:nth-child(3)",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e6]:
      - link [ref=e8] [cursor=pointer]:
        - /url: /
      - navigation [ref=e10]:
        - list [ref=e11]:
          - listitem [ref=e12] [cursor=pointer]:
            - generic [ref=e13]: Personal Training
          - listitem [ref=e14] [cursor=pointer]:
            - generic [ref=e15]: Nutrition
          - listitem [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: Wellness
          - listitem [ref=e18] [cursor=pointer]:
            - link "Membership" [ref=e19]:
              - /url: /membership
          - listitem [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: Deals
          - listitem [ref=e22] [cursor=pointer]:
            - generic [ref=e23]: Specializations
          - listitem [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: Resources
      - generic [ref=e26]:
        - link "800-460-6276" [ref=e27] [cursor=pointer]:
          - /url: tel:8004606276
          - img [ref=e28]
          - generic [ref=e30]: 800-460-6276
        - button "Sign in" [ref=e32] [cursor=pointer]:
          - generic [ref=e33]: Sign in
        - button "Search" [ref=e35] [cursor=pointer]:
          - img [ref=e36]
        - button "Shopping cart" [ref=e39] [cursor=pointer]:
          - img [ref=e40]
          - text: "0"
    - text: "0"
  - main [ref=e42]:
    - paragraph [ref=e45]: "Today's Extended Phone Hours: 5am - 8pm PST. Please call 800-460-6276, Option 1"
    - generic [ref=e48]:
      - img "Male athlete doing workout with female NASM trainer" [ref=e51]
      - generic [ref=e52]:
        - paragraph [ref=e53]: FLASH SALE! SAVE UP TO 60%
        - heading "Job by January Sale" [level=1] [ref=e54]
        - paragraph [ref=e56]:
          - strong [ref=e57]: Get certified. Get to work. With an interview guarantee behind you.
        - paragraph [ref=e58]: Top gyms look for the cert you're about to earn. Earn yours and NASM guarantees you an interview at Life Time, 24 Hour Fitness, Equinox, Crunch Fitness, and more.* Be career-ready for January.
        - link "Get Certified" [ref=e60] [cursor=pointer]:
          - /url: /nasm
    - generic [ref=e61]:
      - heading "Accelerate your fitness career" [level=2] [ref=e68]
      - generic [ref=e72]:
        - tablist [ref=e74]:
          - listitem [ref=e75]:
            - tab "START YOUR CAREER" [selected] [ref=e76] [cursor=pointer]
          - listitem [ref=e77]:
            - tab "ENHANCE YOUR SKILLS" [ref=e78] [cursor=pointer]
          - listitem [ref=e79]:
            - tab "LEVEL UP YOUR CREDENTIALS" [ref=e80] [cursor=pointer]
        - tabpanel "START YOUR CAREER" [ref=e82]:
          - generic [ref=e84]:
            - group "1 / 9" [ref=e85] [cursor=pointer]:
              - generic "Certified Personal Trainer Self Study" [ref=e86]:
                - link "/products/become-a-personal-trainer" [ref=e87]:
                  - /url: https://www.nasm.org/products/become-a-personal-trainer
                - generic [ref=e89]:
                  - generic [ref=e90]: NCCA-ACCREDITED
                  - generic [ref=e91]: Certified Personal Trainer Self-Study
                  - generic [ref=e92]:
                    - generic [ref=e93]: STARTING AT
                    - generic [ref=e95]: $47/Month
            - group "2 / 9" [ref=e96] [cursor=pointer]:
              - generic "Fitness and Nutrition Bundle" [ref=e97]:
                - link "/products/nutrition-and-fitness-coach-bundle" [ref=e98]:
                  - /url: https://www.nasm.org/products/nutrition-and-fitness-coach-bundle
                - generic [ref=e99]: OVER 40% OFF
                - generic [ref=e101]:
                  - generic [ref=e102]: HIGHEST RETURN ON INVESTMENT
                  - generic [ref=e103]: Nutrition & Fitness Coach Bundle
                  - generic [ref=e104]:
                    - generic [ref=e105]: STARTING AT
                    - generic [ref=e106]:
                      - generic [ref=e107]: $54/Month
                      - generic [ref=e108]: $100.00
            - group "3 / 9" [ref=e109] [cursor=pointer]:
              - generic "Extra Support Coaching" [ref=e110]:
                - link "/products/cpt-premium-self-study-program" [ref=e111]:
                  - /url: https://www.nasm.org/products/cpt-premium-self-study-program
                - generic [ref=e112]: OVER 10% OFF
                - generic [ref=e114]:
                  - generic [ref=e115]: FASTEST PATH TO CERTIFICATION
                  - generic [ref=e116]: Certified Personal Trainer Premium Self-Study
                  - generic [ref=e117]:
                    - generic [ref=e118]: STARTING AT
                    - generic [ref=e119]:
                      - generic [ref=e120]: $61/Month
                      - generic [ref=e121]: $71.00
            - group "4 / 9" [ref=e122] [cursor=pointer]:
              - generic "Essentials Bundle" [ref=e123]:
                - link "/products/cpt-essentials-bundle" [ref=e124]:
                  - /url: https://www.nasm.org/products/cpt-essentials-bundle
                - generic [ref=e125]: FLASH SALE
                - generic [ref=e127]:
                  - generic [ref=e128]: EMPLOYER-PREFERRED BUNDLE
                  - generic [ref=e129]: CPT Essentials Bundle
                  - generic [ref=e130]:
                    - generic [ref=e131]: STARTING AT
                    - generic [ref=e132]:
                      - generic [ref=e133]: $68/Month
                      - generic [ref=e134]: $138.00
            - group "5 / 9" [ref=e135] [cursor=pointer]:
              - generic "Exclusive Bundle" [ref=e136]:
                - link "/products/exclusive-bundle" [ref=e137]:
                  - /url: https://www.nasm.org/products/exclusive-bundle
                - generic [ref=e138]: FLASH SALE
                - generic [ref=e140]:
                  - generic [ref=e141]: MOST POPULAR BUNDLE
                  - generic [ref=e142]: CPT Exclusive Bundle
                  - generic [ref=e143]:
                    - generic [ref=e144]: STARTING AT
                    - generic [ref=e145]:
                      - generic [ref=e146]: $72/Month
                      - generic [ref=e147]: $191.00
            - group "6 / 9" [ref=e148] [cursor=pointer]:
              - generic "Elite Trainer Bundle" [ref=e149]:
                - link "/products/nasm-elite-trainer-bundle" [ref=e150]:
                  - /url: https://www.nasm.org/products/nasm-elite-trainer-bundle
                - generic [ref=e151]: FLASH SALE
                - generic [ref=e153]:
                  - generic [ref=e154]: BEST VALUE
                  - generic [ref=e155]: Elite Trainer Bundle
                  - generic [ref=e156]:
                    - generic [ref=e157]: STARTING AT
                    - generic [ref=e158]:
                      - generic [ref=e159]: $99/Month
                      - generic [ref=e160]: $273.00
            - group "7 / 9" [ref=e161] [cursor=pointer]:
              - generic "Training" [ref=e162]:
                - link "/products/cpt-all-inclusive-program" [ref=e163]:
                  - /url: https://www.nasm.org/products/cpt-all-inclusive-program
                - generic [ref=e164]: OVER 25% OFF
                - generic [ref=e166]:
                  - generic [ref=e167]: TOP PERFORMING PROGRAMS
                  - generic [ref=e168]: CPT All-Inclusive
                  - generic [ref=e169]:
                    - generic [ref=e170]: STARTING AT
                    - generic [ref=e171]:
                      - generic [ref=e172]: $69/Month
                      - generic [ref=e173]: $100.00
            - group "8 / 9" [ref=e174] [cursor=pointer]:
              - generic "Fitness and Wellness Bundle" [ref=e175]:
                - link "/products/fitness-wellness-bundle" [ref=e176]:
                  - /url: https://www.nasm.org/products/fitness-wellness-bundle
                - generic [ref=e177]: OVER 45% OFF
                - generic [ref=e179]:
                  - generic [ref=e180]: HIGHEST EARNING POTENTIAL
                  - generic [ref=e181]: Fitness & Wellness Bundle
                  - generic [ref=e182]:
                    - generic [ref=e183]: STARTING AT
                    - generic [ref=e184]:
                      - generic [ref=e185]: $69/Month
                      - generic [ref=e186]: $144.00
            - group "9 / 9" [ref=e187] [cursor=pointer]:
              - generic "Training" [ref=e188]:
                - link "/products/career-kickstarter-bundle" [ref=e189]:
                  - /url: https://www.nasm.org/products/career-kickstarter-bundle
                - generic [ref=e190]: 55% OFF
                - generic [ref=e192]:
                  - generic [ref=e193]: POPULAR WITH NEW COACHES
                  - generic [ref=e194]: Career Kickstarter Bundle
                  - generic [ref=e195]:
                    - generic [ref=e196]: STARTING AT
                    - generic [ref=e197]:
                      - generic [ref=e198]: $74/Month
                      - generic [ref=e199]: $176.00
          - generic [ref=e201]:
            - button "Go to slide 1" [ref=e202] [cursor=pointer]
            - button "Go to slide 2" [ref=e203] [cursor=pointer]
            - button "Go to slide 3" [ref=e204] [cursor=pointer]
            - button "Go to slide 4" [ref=e205] [cursor=pointer]
            - button "Go to slide 5" [ref=e206] [cursor=pointer]
            - button "Go to slide 6" [ref=e207] [cursor=pointer]
      - paragraph [ref=e209]:
        - link "Explore All Courses" [ref=e210] [cursor=pointer]:
          - /url: /nasm
    - generic [ref=e213]:
      - generic [ref=e217]:
        - heading "WHY THE BEST TRAINERS GET CERTIFIED WITH NASM" [level=2] [ref=e220]
        - paragraph [ref=e223]: This is the NASM difference – a solid foundation backed by science to support long-term career growth.
      - list [ref=e227]:
        - listitem [ref=e228]:
          - generic [ref=e229]:
            - heading "Science You Can Trust" [level=3] [ref=e231]
            - paragraph [ref=e233]: NASM's proprietary OPT™ Model and credential-earning programs are developed with researchers and peer-reviewed by NASM's Scientific Advisory Board.
        - listitem [ref=e234]:
          - generic [ref=e235]:
            - heading "#1 Accredited Fitness Certification" [level=3] [ref=e237]
            - paragraph [ref=e239]: The NASM Certified Personal Trainer (NASM-CPT) is the highest rated fitness certification, NCCA-accredited, and trusted by employers, gyms, and clients worldwide.
        - listitem [ref=e240]:
          - generic [ref=e241]:
            - heading "22% Higher Earnings*" [level=3] [ref=e243]
            - paragraph [ref=e245]: NASM Certified Personal Trainers (NASM-CPT) earn 22% more on average than industry peers, making certification an investment in your earning potential.
        - listitem [ref=e246]:
          - generic [ref=e247]:
            - heading "Your Professional Advantage" [level=3] [ref=e249]
            - paragraph [ref=e251]: NASM One™ combines continuing education, business-building tools, a professional community, expert support, and exclusive perks in one powerful membership—helping you attract more clients, expand your expertise, and increase your earning potential.
        - listitem [ref=e252]:
          - generic [ref=e253]:
            - heading "Trusted by the Pros Behind the Pros" [level=3] [ref=e255]
            - paragraph [ref=e257]: NASM-credentialed professionals are on staff across 100% of NFL, NBA, MLB, and MLS teams.
        - listitem [ref=e258]:
          - generic [ref=e259]:
            - heading "One Place to Build Your Career" [level=3] [ref=e261]
            - paragraph [ref=e263]: NASM offers certification and specialization programs in personal training, nutrition, performance coaching, and wellness, giving you opportunities to grow throughout your career.
    - generic [ref=e267]:
      - generic [ref=e268]:
        - paragraph [ref=e269]: Exclusive Phone-Only Offer
        - 'heading "LIMITED TIME: YOUR CPT COMES WITH A FREE GIFT" [level=2] [ref=e270]'
        - paragraph [ref=e272]: Call an NASM Advisor to find the CPT option that’s right for your goals and receive a free mystery gift with your purchase.
        - generic [ref=e273]:
          - link "Call 844-902-6489" [ref=e274] [cursor=pointer]:
            - /url: tel:8449026489
          - link "Get a Consultation" [ref=e275] [cursor=pointer]:
            - /url: "#lets-chat-form"
      - img "Two men in athletic wear sit in a gym; one holds a laptop and shows it to the other, during a NASM career consultation, as they both appear to be having a friendly conversation." [ref=e277]
    - generic [ref=e278]:
      - generic [ref=e282]:
        - generic [ref=e284]:
          - heading "Trusted by 1.9M+ Fitness" [level=2] [ref=e285]
          - generic [ref=e286]: Professionals Worldwide
        - paragraph [ref=e289]: Top-rated support from day one.
      - generic [ref=e292]:
        - img "Google logo" [ref=e293]
        - generic [ref=e294]:
          - paragraph [ref=e295]: Google Rating
          - generic [ref=e296]:
            - generic [ref=e297]: "4.9"
            - generic [ref=e298]:
              - img [ref=e299]
              - img [ref=e301]
              - img [ref=e303]
              - img [ref=e305]
              - img [ref=e307]
          - paragraph [ref=e309]: Based on 1,700+ reviews
    - generic [ref=e313]:
      - heading "Gain Credentials trusted across the industry" [level=3] [ref=e315]
      - img "A rectangular badge with the text Americas Top Online Learning Providers 2026 features the Newsweek and Statista logos, set against a blue and gold design with stars on the left side." [ref=e318]
    - generic [ref=e319]:
      - generic [ref=e323]:
        - generic [ref=e325]:
          - text: WE TRAIN THE GREATS
          - generic [ref=e326]: WHO TRAIN THE GREATS
        - paragraph [ref=e329]: The same expertise that fuels the nation’s most elite athletes is at your fingertips, too.
      - generic [ref=e331]:
        - tablist [ref=e332]:
          - tab "NFL" [selected] [ref=e333] [cursor=pointer]
          - tab "NBA" [ref=e334] [cursor=pointer]
          - tab "NHL" [ref=e335] [cursor=pointer]
          - tab "MLS" [ref=e336] [cursor=pointer]
          - tab "NWSL" [ref=e337] [cursor=pointer]
          - tab "WNBA" [ref=e338] [cursor=pointer]
          - tab "MLB" [ref=e339] [cursor=pointer]
        - tabpanel "NFL" [ref=e340]:
          - img "NFL" [ref=e343]
          - paragraph [ref=e345]: NASM-credentialed professionals are part of the performance staff for 100% of NFL teams, developing stronger, faster, more resilient athletes.
    - generic [ref=e346]:
      - generic [ref=e350]:
        - generic [ref=e352]:
          - heading "TOP OF THE CLASS." [level=2] [ref=e353]
          - generic [ref=e354]: TOP OF THEIR GAME.
        - paragraph [ref=e357]:
          - text: NASM-credentialed professionals are shaping the industry and making meaningful impacts in their communities, setting the standard for excellence.
          - text: For more, explore
          - link "NASM in Action" [ref=e358] [cursor=pointer]:
            - /url: /nasm-in-action
          - text: .
      - generic [ref=e362]:
        - generic [ref=e364]:
          - group "1 / 5" [ref=e365] [cursor=pointer]:
            - generic "Courtney" [ref=e366]:
              - generic [ref=e367]:
                - generic [ref=e368]:
                  - generic [ref=e369]: Courtney F.
                  - generic [ref=e370]: NASM CPT, WLS, CNC
                - generic:
                  - paragraph: “I am a happier person, I am a stronger person, and I am more confident since gaining all three of my certifications with NASM. I am now training thousands of women across the world. Without NASM, I wouldn't have been able to do any of this.”
          - group "2 / 5" [ref=e371] [cursor=pointer]:
            - generic "Jordan K." [ref=e372]:
              - generic [ref=e373]:
                - generic [ref=e374]:
                  - generic [ref=e375]: Jordan K.
                  - generic [ref=e376]: NASM PES, CES
                - generic:
                  - paragraph: “Given NASM’s reputation as a respected and science-driven institution, I knew these credentials would help set me apart—and they absolutely have. They’ve equipped me with tools I use daily in my work with high-level performers.”
          - group "3 / 5" [ref=e377] [cursor=pointer]:
            - generic "Jack" [ref=e378]:
              - generic [ref=e379]:
                - generic [ref=e380]:
                  - generic [ref=e381]: Jack T.
                  - generic [ref=e382]: NASM CPT
                - generic:
                  - paragraph: “Anything that you want to do in life, NASM will help you get there and help you achieve your goals. Whatever it is that you're looking to specialize in, they have the professionals to help you get there.”
          - group "4 / 5" [ref=e383] [cursor=pointer]:
            - generic "Melina S." [ref=e384]:
              - generic [ref=e385]:
                - generic [ref=e386]:
                  - generic [ref=e387]: Melina S.
                  - generic [ref=e388]: NASM CPT, CNC
                - generic:
                  - paragraph: “When I first got certified as a CPT, I felt very confident with everything I learned and very well prepared for the job. I became a CNC on top of my CPT certification in order to help my clients achieve their goals in a broader way.”
          - group "5 / 5" [ref=e389] [cursor=pointer]:
            - generic "Fred H." [ref=e390]:
              - generic [ref=e391]:
                - generic [ref=e392]:
                  - generic [ref=e393]: Fred H.
                  - generic [ref=e394]: NASM CPT
                - generic:
                  - paragraph: “NASM has taught me that the link between my physical wellbeing and my mental wellbeing is important. By balancing those two, I think it allows me to become a better trainer and mentor for a lot of the youth that I work with.”
        - generic [ref=e396]:
          - button "Go to slide 1" [ref=e397] [cursor=pointer]
          - button "Go to slide 2" [ref=e398] [cursor=pointer]
          - button "Go to slide 3" [ref=e399] [cursor=pointer]
    - generic [ref=e400]:
      - paragraph [ref=e402]:
        - generic:
          - img "training"
      - generic [ref=e404]:
        - heading "Frequently Asked Questions" [level=2] [ref=e407]
        - generic [ref=e408]:
          - generic [ref=e409]:
            - button "What makes NASM different from other credentialing programs?" [ref=e410] [cursor=pointer]
            - generic "What makes NASM different from other credentialing programs?":
              - paragraph [ref=e411]: NASM stands out for its science-based approach, industry-leading reputation, and comprehensive support system. From cutting-edge content to career resources, NASM prepares you not just to pass a test—but to thrive as a fitness professional.
          - generic [ref=e412]:
            - button "How long has NASM been certifying fitness professionals?" [ref=e413] [cursor=pointer]
            - generic "How long has NASM been certifying fitness professionals?":
              - paragraph [ref=e414]: NASM has been certifying fitness professionals for more than 35 years, earning trust and recognition across the fitness industry.
          - generic [ref=e415]:
            - button "Can the personal trainer certification be completed online?" [ref=e416] [cursor=pointer]
            - generic "Can the personal trainer certification be completed online?":
              - paragraph [ref=e417]: Yes, the NASM Certified Personal Trainer program can be completed 100% online. With interactive content, video demonstrations, and digital resources, you get a robust learning experience from anywhere, at any time.
          - generic [ref=e418]:
            - button "How long will the Certified Personal Trainer program take me?" [ref=e419] [cursor=pointer]
            - generic "How long will the Certified Personal Trainer program take me?":
              - paragraph [ref=e420]: You can complete the NASM Certified Personal Trainer program in as few as 4 to 6 weeks, depending on your schedule and pace. With flexible learning options and expert support, you’re in control of your timeline.
          - generic [ref=e421]:
            - button "How much do NASM certified personal trainers earn?*" [ref=e422] [cursor=pointer]
            - generic "How much do NASM certified personal trainers earn?*":
              - paragraph [ref=e423]:
                - text: NASM-CPT qualifies you to work as a personal trainer in gyms, studios, or independently. In the 2026 State of the Personal Trainer Survey (N = 1,133, ±2.9%, 95% confidence), NASM Certified Personal Trainers reported earning 22% more than the industry average, with new personal trainers averaging $48 an hour. To view the full report, click
                - link "here" [ref=e424] [cursor=pointer]:
                  - /url: https://2494739.fs1.hubspotusercontent-na1.net/hubfs/2494739/2026-State-of-Personal-Trainer-Report-by-NASM.pdf
                - text: .
          - generic [ref=e425]:
            - button "What is the NASM Interview Guarantee?" [ref=e426] [cursor=pointer]
            - generic "What is the NASM Interview Guarantee?":
              - paragraph [ref=e427]:
                - text: The NASM Interview Guarantee provides a guaranteed interview at a participating gym for everyone who passes the NASM-CPT Certification Exam. It is included with every NASM-CPT program at no added cost. Terms and conditions apply. The Interview Guarantee does not guarantee a job placement. Learn more about our Interview Guarantee program
                - link "here" [ref=e428] [cursor=pointer]:
                  - /url: https://support.nasm.org/interview-guarantee
                - text: .
        - paragraph [ref=e431]:
          - text: If you have any additional questions about this course, check out the
          - link "NASM FAQ" [ref=e432] [cursor=pointer]:
            - /url: https://support.nasm.org/
          - text: page or contact us today
          - link "1-800-460-6276" [ref=e433] [cursor=pointer]:
            - /url: tel:8004606276
          - text: "!"
    - generic [ref=e434]:
      - heading "Recognized by everyone." [level=3] [ref=e436]
      - list [ref=e439]:
        - listitem [ref=e440]:
          - generic:
            - generic:
              - img "lifetime fitness logo"
        - listitem [ref=e441]:
          - generic:
            - generic:
              - img "24 hours fitness logo"
        - listitem [ref=e442]:
          - generic:
            - generic:
              - img "golds gym logo"
        - listitem [ref=e443]:
          - generic:
            - generic:
              - img "hyperice logo"
        - listitem [ref=e444]:
          - generic:
            - generic:
              - img "anytime fitness logo"
        - listitem [ref=e445]:
          - generic:
            - generic:
              - img "ufc gym logo"
    - generic [ref=e446]:
      - generic [ref=e450]:
        - generic [ref=e452]:
          - text: THIS IS YOUR
          - generic [ref=e453]: STARTING LINE
        - paragraph [ref=e456]: Millions of fitness professionals started where you are. Today, they lead the industry. Now, it’s your turn.
      - generic [ref=e458]:
        - generic [ref=e459]:
          - heading "READY TO TAKE THAT FIRST STEP? LET’S CHAT." [level=2] [ref=e460]:
            - text: READY TO TAKE THAT FIRST STEP?
            - text: LET’S CHAT.
          - paragraph [ref=e462]: Fill out the form below, and we’ll be in touch within one business day.
        - generic [ref=e464]:
          - textbox [ref=e467]:
            - /placeholder: First Name*
          - textbox [ref=e470]:
            - /placeholder: Last Name*
          - textbox [ref=e473]:
            - /placeholder: Email*
          - textbox [ref=e476]:
            - /placeholder: Phone*
          - list [ref=e479]:
            - listitem [ref=e480]:
              - generic [ref=e481] [cursor=pointer]:
                - checkbox "I consent to receive SMS texts from NASM. Msg/Data rates may apply. Reply STOP to cancel." [ref=e482]
                - generic [ref=e483]: I consent to receive SMS texts from NASM. Msg/Data rates may apply. Reply STOP to cancel.
          - paragraph [ref=e486]:
            - text: By submitting this form you consent to receive recurring marketing emails and agree to our
            - link "Privacy Policy" [ref=e487] [cursor=pointer]:
              - /url: https://auth.nasm.org/policy.html
            - text: . You may unsubscribe at any time.
          - button "Submit" [ref=e490] [cursor=pointer]
        - generic [ref=e491]:
          - paragraph [ref=e492]: "Can’t wait? Call now to speak with a program advisor instantly:"
          - paragraph [ref=e493]:
            - link "1.800.460.6276" [ref=e494] [cursor=pointer]:
              - /url: tel:8004606276
  - contentinfo [ref=e495]:
    - generic [ref=e497]:
      - generic [ref=e498]:
        - generic [ref=e500]:
          - img "NASM Logo" [ref=e504]
          - list [ref=e507]:
            - listitem [ref=e508]:
              - link "Instagram" [ref=e509] [cursor=pointer]:
                - /url: https://www.instagram.com/nasmfitness/
                - img "Instagram" [ref=e510]
            - listitem [ref=e511]:
              - link "YouTube" [ref=e512] [cursor=pointer]:
                - /url: https://www.youtube.com/channel/UCjWgUFeyDbeQ3Q_eVCup_7Q
                - img "YouTube" [ref=e513]
            - listitem [ref=e514]:
              - link "X" [ref=e515] [cursor=pointer]:
                - /url: https://x.com/NASM
                - img "X" [ref=e516]
            - listitem [ref=e517]:
              - link "TikTok" [ref=e518] [cursor=pointer]:
                - /url: https://www.tiktok.com/@nasmfitness
                - img "TikTok" [ref=e519]
            - listitem [ref=e520]:
              - link "Facebook" [ref=e521] [cursor=pointer]:
                - /url: https://www.facebook.com/personaltrainers/
                - img "Facebook" [ref=e522]
          - generic [ref=e524]:
            - paragraph [ref=e525]:
              - link "1.800.460.6276" [ref=e526] [cursor=pointer]:
                - /url: tel:18004606276
            - paragraph [ref=e527]: 355 E. Germann Rd Ste. 201,
            - paragraph [ref=e528]: Gilbert, AZ 85297
        - navigation "Footer navigation" [ref=e531]:
          - generic [ref=e532]:
            - button "Shop" [expanded]
            - region "Shop" [ref=e533]:
              - link "Certified Personal Trainer" [ref=e534] [cursor=pointer]:
                - /url: https://www.nasm.org/products/become-a-personal-trainer
              - link "Nutrition & Wellness" [ref=e535] [cursor=pointer]:
                - /url: https://www.nasm.org/nasm?focus=Nutrition%2CWellness
              - link "NASM One Membership" [ref=e536] [cursor=pointer]:
                - /url: https://www.nasm.org/membership
              - link "Specializations" [ref=e537] [cursor=pointer]:
                - /url: https://www.nasm.org/nasm?course_type=Specialization
              - link "Course Bundles" [ref=e538] [cursor=pointer]:
                - /url: https://www.nasm.org/search?sort=relevance&sortDirection=desc&q=bundles
              - link "Apparel" [ref=e539] [cursor=pointer]:
                - /url: https://sideline.bsnsports.com/schools/arizona/gilbert/national-academy-of-sports-medicine
          - generic [ref=e540]:
            - button "About" [expanded]
            - region "About" [ref=e541]:
              - link "About NASM" [ref=e542] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm
              - link "NASM Support" [ref=e543] [cursor=pointer]:
                - /url: https://support.nasm.org/
              - link "Contact Us" [ref=e544] [cursor=pointer]:
                - /url: https://www.nasm.org/contact-us
              - link "Press" [ref=e545] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm/nasm-news-pressroom
              - link "Accreditation" [ref=e546] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm/accreditation
              - link "NASM Careers" [ref=e547] [cursor=pointer]:
                - /url: https://ascendlearning.jobs.hr.cloud.sap/
              - link "Military Discounts" [ref=e548] [cursor=pointer]:
                - /url: https://www.nasm.org/certified-personal-trainer/military-support
          - generic [ref=e549]:
            - button "Trainer Resources" [expanded]
            - region "Trainer Resources" [ref=e550]:
              - link "Job Board" [ref=e551] [cursor=pointer]:
                - /url: https://www.nasmjobs.com/
              - link "Pro Discounts" [ref=e552] [cursor=pointer]:
                - /url: https://www.nasm.org/discountpartners
              - link "Insurance" [ref=e553] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/insurance
              - link "Digital Badges" [ref=e554] [cursor=pointer]:
                - /url: https://www.nasm.org/digital-badges
              - link "Validate Credentials" [ref=e555] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/validate-credentials
              - link "Recertification" [ref=e556] [cursor=pointer]:
                - /url: https://www.nasm.org/products/nasm-recertification-and-renewal-information
              - link "Candidate Handbook" [ref=e557] [cursor=pointer]:
                - /url: https://2494739.fs1.hubspotusercontent-na1.net/hubfs/2494739/NASM%20Candidate%20Handbook%202026.pdf
          - generic [ref=e558]:
            - button "Partners & Brands" [expanded]
            - region "Partners & Brands" [ref=e559]:
              - link "Partner With NASM" [ref=e560] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm/partnerships
              - link "Academic Partners" [ref=e561] [cursor=pointer]:
                - /url: https://www.nasm.org/academic
              - link "International Partners" [ref=e562] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/international-partners
              - link "Find a Partner School" [ref=e563] [cursor=pointer]:
                - /url: https://www.nasm.org/academic/featured-schools
              - link "Course Providers" [ref=e564] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/preferred-providers
              - link "AFAA" [ref=e565] [cursor=pointer]:
                - /url: https://www.afaa.com/?__hstc=17162406.4e2e605ba230db9d949e827f1bdb39ec.1759500538529.1761240984269.1761249852792.77&__hssc=17162406.24.1761249852792&__hsfp=2619848739
              - link "ClubConnect" [ref=e566] [cursor=pointer]:
                - /url: https://www.clubconnect.com/
          - status [ref=e567]
        - list [ref=e569]:
          - listitem [ref=e570]: Start Training. Start Training. Start Training. Start Training. Start Training. Start Training. Start Training. Start Training. Start Training.
      - generic [ref=e575]:
        - paragraph [ref=e576]: Copyright © 2026 National Academy of Sports Medicine, LLC. All rights reserved.
        - list [ref=e577]:
          - listitem [ref=e578]:
            - link "Privacy Policy" [ref=e579] [cursor=pointer]:
              - /url: https://auth.nasm.org/policy.html
            - text: /
          - listitem [ref=e580]:
            - link "Notice for California Residents" [ref=e581] [cursor=pointer]:
              - /url: https://auth.nasm.org/policy.html#privacy_information_ca
            - text: /
          - listitem [ref=e582]:
            - link "Website Terms of Use" [ref=e583] [cursor=pointer]:
              - /url: https://auth-platformtraining.ascendlearning.com/website_terms.html
            - text: /
          - listitem [ref=e584]:
            - link "Terms & Conditions" [ref=e585] [cursor=pointer]:
              - /url: https://auth.nasm.org/terms.html
            - text: /
          - listitem [ref=e586]:
            - link "Your Privacy Choices" [ref=e587] [cursor=pointer]:
              - /url: "#"
        - paragraph [ref=e588]:
          - text: This site is protected by reCAPTCHA and the
          - link "Google Privacy Policy" [ref=e589] [cursor=pointer]:
            - /url: https://policies.google.com/privacy
          - text: and
          - link "Terms of Service" [ref=e590] [cursor=pointer]:
            - /url: https://policies.google.com/terms
          - text: apply.
      - generic [ref=e592]:
        - generic [ref=e594]:
          - generic [ref=e595]:
            - group "1 / 3" [ref=e596]:
              - generic [ref=e597]:
                - link "Job by January Sale | Save up to 60%" [ref=e598] [cursor=pointer]:
                  - /url: https://www.nasm.org/nasm?show_only=On+Sale
                  - strong [ref=e599]: Job by January Sale | Save up to 60%
                - generic [ref=e601]:
                  - generic [ref=e602]:
                    - generic [ref=e603]: "00"
                    - generic [ref=e604]: Days
                  - generic [ref=e605]:
                    - generic [ref=e606]: "12"
                    - generic [ref=e607]: Hours
                  - generic [ref=e608]:
                    - generic [ref=e609]: "42"
                    - generic [ref=e610]: Min
                  - generic [ref=e611]:
                    - generic [ref=e612]: "09"
                    - generic [ref=e613]: Sec
            - group "2 / 3" [ref=e614]:
              - link "GLP‑1s are Changing Fitness. Stay Ahead with Our Updated Course!" [ref=e616] [cursor=pointer]:
                - /url: https://www.nasm.org/products/understanding-weight-loss-medications
            - group "3 / 3" [ref=e617]:
              - generic [ref=e618]:
                - generic [ref=e619]: "Phone-Only: Free Gift With Any CPT Purchase"
                - button "Call Now (844) 902-6489" [ref=e620] [cursor=pointer]:
                  - strong [ref=e621]: Call Now
                  - text: (844) 902-6489
          - button "Previous slide" [ref=e622] [cursor=pointer]: prev
          - button "Next slide" [ref=e623] [cursor=pointer]: next
        - text: prev next
  - dialog "Consent Banner" [ref=e624]:
    - generic [ref=e625]:
      - generic [ref=e627]:
        - text: We value your privacy and respect your preferences. We allow certain online advertising partners to collect information from our services (e.g., device identifiers and usage information) through technologies such as cookies and pixels to deliver ads that are more relevant to you and assist us with related analytics activities. This may be considered "selling" or "sharing/processing” for targeted online advertising under applicable law. To opt out of these activities, please click "Manage". Please read our
        - link "Privacy Policy" [ref=e629] [cursor=pointer]:
          - /url: https://auth.nasm.org/policy.html
        - text: to learn about all of our data processing activities and your choices.
      - generic [ref=e630]:
        - button "Manage" [ref=e631] [cursor=pointer]
        - button "Okay" [ref=e632] [cursor=pointer]
  - generic:
    - generic:
      - generic:
        - generic:
          - button "Click To Chat With Us"
        - generic "Unread messages indicator": "0"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import { createHtmlReport } from 'axe-html-reporter';
  4  | 
  5  | test('example accessibility test', async ({ page }, testInfo) => {
  6  |   // 1. Navigate to the page
  7  |   await page.goto('https://www.nasm.org/');
  8  | 
  9  |   // 2. Wait for dynamic page elements to render before scanning
  10 |   await page.waitForSelector('footer');
  11 | 
  12 |   // 3. Configure and run Axe Scan
  13 |   const accessibilityScanResults = await new AxeBuilder({ page })
  14 |     .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  15 |     .disableRules(['aria-prohibited-attr'])
  16 |     .analyze();
  17 | 
  18 |   // 4. Generate visual HTML Accessibility Report
  19 |   createHtmlReport({
  20 |     results: accessibilityScanResults,
  21 |     options: {
  22 |       projectKey: 'ATI Testing Site',
  23 |       outputDir: 'axe-reports',
  24 |       reportFileName: 'accessibility-report.html',
  25 |     },
  26 |   });
  27 | 
  28 |   // 5. Attach raw JSON results to Playwright HTML report
  29 |   await testInfo.attach('accessibility-scan-results', {
  30 |     body: JSON.stringify(accessibilityScanResults.violations, null, 2),
  31 |     contentType: 'application/json',
  32 |   });
  33 | 
  34 |   // 6. Format clean violation summaries for terminal logging
  35 |   const formattedViolations = accessibilityScanResults.violations.map((violation) => ({
  36 |     id: violation.id,
  37 |     impact: violation.impact,
  38 |     description: violation.description,
  39 |     nodesCount: violation.nodes.length,
  40 |     selectors: violation.nodes.map((node) => node.target.join(' ')),
  41 |   }));
  42 | 
  43 |   // 7. Assertion (Use expect.soft if you don't want test failures to stop report generation)
  44 |   expect(
  45 |     formattedViolations, 
  46 |     `Found ${formattedViolations.length} accessibility violation(s)`
> 47 |   ).toEqual([]);
     |     ^ Error: Found 6 accessibility violation(s)
  48 | });
```