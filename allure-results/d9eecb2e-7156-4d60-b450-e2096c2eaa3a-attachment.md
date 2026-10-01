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
  - link [ref=e2] [cursor=pointer]:
    - /url: "#"
    - text: ___
  - banner [ref=e4]:
    - generic [ref=e8]:
      - link [ref=e10] [cursor=pointer]:
        - /url: /
      - navigation [ref=e12]:
        - list [ref=e13]:
          - listitem [ref=e14] [cursor=pointer]:
            - generic [ref=e15]: Personal Training
          - listitem [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: Nutrition
          - listitem [ref=e18] [cursor=pointer]:
            - generic [ref=e19]: Wellness
          - listitem [ref=e20] [cursor=pointer]:
            - link "Membership" [ref=e21]:
              - /url: /membership
          - listitem [ref=e22] [cursor=pointer]:
            - generic [ref=e23]: Deals
          - listitem [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: Specializations
          - listitem [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: Resources
      - generic [ref=e28]:
        - link "800-460-6276" [ref=e29] [cursor=pointer]:
          - /url: tel:8004606276
          - img [ref=e30]
          - generic [ref=e32]: 800-460-6276
        - button "Sign in" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: Sign in
        - button "Search" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
        - button "Shopping cart" [ref=e41] [cursor=pointer]:
          - img [ref=e42]
          - text: "0"
    - text: "0"
  - main [ref=e44]:
    - paragraph [ref=e47]: "Today's Extended Phone Hours: 5am - 8pm PST. Please call 800-460-6276, Option 1"
    - generic [ref=e50]:
      - img "Male athlete doing workout with female NASM trainer" [ref=e53]
      - generic [ref=e54]:
        - paragraph [ref=e55]: FLASH SALE! SAVE UP TO 60%
        - heading "Job by January Sale" [level=1] [ref=e56]
        - paragraph [ref=e58]:
          - strong [ref=e59]: Get certified. Get to work. With an interview guarantee behind you.
        - paragraph [ref=e60]: Top gyms look for the cert you're about to earn. Earn yours and NASM guarantees you an interview at Life Time, 24 Hour Fitness, Equinox, Crunch Fitness, and more.* Be career-ready for January.
        - link "Get Certified" [ref=e62] [cursor=pointer]:
          - /url: /nasm
    - generic [ref=e63]:
      - heading "Accelerate your fitness career" [level=2] [ref=e70]
      - generic [ref=e74]:
        - tablist [ref=e76]:
          - listitem [ref=e77]:
            - tab "START YOUR CAREER" [selected] [ref=e78] [cursor=pointer]
          - listitem [ref=e79]:
            - tab "ENHANCE YOUR SKILLS" [ref=e80] [cursor=pointer]
          - listitem [ref=e81]:
            - tab "LEVEL UP YOUR CREDENTIALS" [ref=e82] [cursor=pointer]
        - tabpanel "START YOUR CAREER" [ref=e84]:
          - generic [ref=e86]:
            - group "1 / 9" [ref=e87] [cursor=pointer]:
              - generic "Certified Personal Trainer Self Study" [ref=e88]:
                - link "/products/become-a-personal-trainer" [ref=e89]:
                  - /url: https://www.nasm.org/products/become-a-personal-trainer
                - generic [ref=e91]:
                  - generic [ref=e92]: NCCA-ACCREDITED
                  - generic [ref=e93]: Certified Personal Trainer Self-Study
                  - generic [ref=e94]:
                    - generic [ref=e95]: STARTING AT
                    - generic [ref=e97]: $47/Month
            - group "2 / 9" [ref=e98] [cursor=pointer]:
              - generic "Fitness and Nutrition Bundle" [ref=e99]:
                - link "/products/nutrition-and-fitness-coach-bundle" [ref=e100]:
                  - /url: https://www.nasm.org/products/nutrition-and-fitness-coach-bundle
                - generic [ref=e101]: OVER 40% OFF
                - generic [ref=e103]:
                  - generic [ref=e104]: HIGHEST RETURN ON INVESTMENT
                  - generic [ref=e105]: Nutrition & Fitness Coach Bundle
                  - generic [ref=e106]:
                    - generic [ref=e107]: STARTING AT
                    - generic [ref=e108]:
                      - generic [ref=e109]: $54/Month
                      - generic [ref=e110]: $100.00
            - group "3 / 9" [ref=e111] [cursor=pointer]:
              - generic "Extra Support Coaching" [ref=e112]:
                - link "/products/cpt-premium-self-study-program" [ref=e113]:
                  - /url: https://www.nasm.org/products/cpt-premium-self-study-program
                - generic [ref=e114]: OVER 10% OFF
                - generic [ref=e116]:
                  - generic [ref=e117]: FASTEST PATH TO CERTIFICATION
                  - generic [ref=e118]: Certified Personal Trainer Premium Self-Study
                  - generic [ref=e119]:
                    - generic [ref=e120]: STARTING AT
                    - generic [ref=e121]:
                      - generic [ref=e122]: $61/Month
                      - generic [ref=e123]: $71.00
            - group "4 / 9" [ref=e124] [cursor=pointer]:
              - generic "Essentials Bundle" [ref=e125]:
                - link "/products/cpt-essentials-bundle" [ref=e126]:
                  - /url: https://www.nasm.org/products/cpt-essentials-bundle
                - generic [ref=e127]: FLASH SALE
                - generic [ref=e129]:
                  - generic [ref=e130]: EMPLOYER-PREFERRED BUNDLE
                  - generic [ref=e131]: CPT Essentials Bundle
                  - generic [ref=e132]:
                    - generic [ref=e133]: STARTING AT
                    - generic [ref=e134]:
                      - generic [ref=e135]: $68/Month
                      - generic [ref=e136]: $138.00
            - group "5 / 9" [ref=e137] [cursor=pointer]:
              - generic "Exclusive Bundle" [ref=e138]:
                - link "/products/exclusive-bundle" [ref=e139]:
                  - /url: https://www.nasm.org/products/exclusive-bundle
                - generic [ref=e140]: FLASH SALE
                - generic [ref=e142]:
                  - generic [ref=e143]: MOST POPULAR BUNDLE
                  - generic [ref=e144]: CPT Exclusive Bundle
                  - generic [ref=e145]:
                    - generic [ref=e146]: STARTING AT
                    - generic [ref=e147]:
                      - generic [ref=e148]: $72/Month
                      - generic [ref=e149]: $191.00
            - group "6 / 9" [ref=e150] [cursor=pointer]:
              - generic "Elite Trainer Bundle" [ref=e151]:
                - link "/products/nasm-elite-trainer-bundle" [ref=e152]:
                  - /url: https://www.nasm.org/products/nasm-elite-trainer-bundle
                - generic [ref=e153]: FLASH SALE
                - generic [ref=e155]:
                  - generic [ref=e156]: BEST VALUE
                  - generic [ref=e157]: Elite Trainer Bundle
                  - generic [ref=e158]:
                    - generic [ref=e159]: STARTING AT
                    - generic [ref=e160]:
                      - generic [ref=e161]: $99/Month
                      - generic [ref=e162]: $273.00
            - group "7 / 9" [ref=e163] [cursor=pointer]:
              - generic "Training" [ref=e164]:
                - link "/products/cpt-all-inclusive-program" [ref=e165]:
                  - /url: https://www.nasm.org/products/cpt-all-inclusive-program
                - generic [ref=e166]: OVER 25% OFF
                - generic [ref=e168]:
                  - generic [ref=e169]: TOP PERFORMING PROGRAMS
                  - generic [ref=e170]: CPT All-Inclusive
                  - generic [ref=e171]:
                    - generic [ref=e172]: STARTING AT
                    - generic [ref=e173]:
                      - generic [ref=e174]: $69/Month
                      - generic [ref=e175]: $100.00
            - group "8 / 9" [ref=e176] [cursor=pointer]:
              - generic "Fitness and Wellness Bundle" [ref=e177]:
                - link "/products/fitness-wellness-bundle" [ref=e178]:
                  - /url: https://www.nasm.org/products/fitness-wellness-bundle
                - generic [ref=e179]: OVER 45% OFF
                - generic [ref=e181]:
                  - generic [ref=e182]: HIGHEST EARNING POTENTIAL
                  - generic [ref=e183]: Fitness & Wellness Bundle
                  - generic [ref=e184]:
                    - generic [ref=e185]: STARTING AT
                    - generic [ref=e186]:
                      - generic [ref=e187]: $69/Month
                      - generic [ref=e188]: $144.00
            - group "9 / 9" [ref=e189] [cursor=pointer]:
              - generic "Training" [ref=e190]:
                - link "/products/career-kickstarter-bundle" [ref=e191]:
                  - /url: https://www.nasm.org/products/career-kickstarter-bundle
                - generic [ref=e192]: 55% OFF
                - generic [ref=e194]:
                  - generic [ref=e195]: POPULAR WITH NEW COACHES
                  - generic [ref=e196]: Career Kickstarter Bundle
                  - generic [ref=e197]:
                    - generic [ref=e198]: STARTING AT
                    - generic [ref=e199]:
                      - generic [ref=e200]: $74/Month
                      - generic [ref=e201]: $176.00
          - generic [ref=e203]:
            - button "Go to slide 1" [ref=e204] [cursor=pointer]
            - button "Go to slide 2" [ref=e205] [cursor=pointer]
            - button "Go to slide 3" [ref=e206] [cursor=pointer]
            - button "Go to slide 4" [ref=e207] [cursor=pointer]
            - button "Go to slide 5" [ref=e208] [cursor=pointer]
            - button "Go to slide 6" [ref=e209] [cursor=pointer]
      - paragraph [ref=e211]:
        - link "Explore All Courses" [ref=e212] [cursor=pointer]:
          - /url: /nasm
    - generic [ref=e215]:
      - generic [ref=e219]:
        - heading "WHY THE BEST TRAINERS GET CERTIFIED WITH NASM" [level=2] [ref=e222]
        - paragraph [ref=e225]: This is the NASM difference – a solid foundation backed by science to support long-term career growth.
      - list [ref=e229]:
        - listitem [ref=e230]:
          - generic [ref=e231]:
            - heading "Science You Can Trust" [level=3] [ref=e233]
            - paragraph [ref=e235]: NASM's proprietary OPT™ Model and credential-earning programs are developed with researchers and peer-reviewed by NASM's Scientific Advisory Board.
        - listitem [ref=e236]:
          - generic [ref=e237]:
            - heading "#1 Accredited Fitness Certification" [level=3] [ref=e239]
            - paragraph [ref=e241]: The NASM Certified Personal Trainer (NASM-CPT) is the highest rated fitness certification, NCCA-accredited, and trusted by employers, gyms, and clients worldwide.
        - listitem [ref=e242]:
          - generic [ref=e243]:
            - heading "22% Higher Earnings*" [level=3] [ref=e245]
            - paragraph [ref=e247]: NASM Certified Personal Trainers (NASM-CPT) earn 22% more on average than industry peers, making certification an investment in your earning potential.
        - listitem [ref=e248]:
          - generic [ref=e249]:
            - heading "Your Professional Advantage" [level=3] [ref=e251]
            - paragraph [ref=e253]: NASM One™ combines continuing education, business-building tools, a professional community, expert support, and exclusive perks in one powerful membership—helping you attract more clients, expand your expertise, and increase your earning potential.
        - listitem [ref=e254]:
          - generic [ref=e255]:
            - heading "Trusted by the Pros Behind the Pros" [level=3] [ref=e257]
            - paragraph [ref=e259]: NASM-credentialed professionals are on staff across 100% of NFL, NBA, MLB, and MLS teams.
        - listitem [ref=e260]:
          - generic [ref=e261]:
            - heading "One Place to Build Your Career" [level=3] [ref=e263]
            - paragraph [ref=e265]: NASM offers certification and specialization programs in personal training, nutrition, performance coaching, and wellness, giving you opportunities to grow throughout your career.
    - generic [ref=e269]:
      - generic [ref=e270]:
        - paragraph [ref=e271]: Exclusive Phone-Only Offer
        - 'heading "LIMITED TIME: YOUR CPT COMES WITH A FREE GIFT" [level=2] [ref=e272]'
        - paragraph [ref=e274]: Call an NASM Advisor to find the CPT option that’s right for your goals and receive a free mystery gift with your purchase.
        - generic [ref=e275]:
          - link "Call 844-902-6489" [ref=e276] [cursor=pointer]:
            - /url: tel:8449026489
          - link "Get a Consultation" [ref=e277] [cursor=pointer]:
            - /url: "#lets-chat-form"
      - img "Two men in athletic wear sit in a gym; one holds a laptop and shows it to the other, during a NASM career consultation, as they both appear to be having a friendly conversation." [ref=e279]
    - generic [ref=e280]:
      - generic [ref=e284]:
        - generic [ref=e286]:
          - heading "Trusted by 1.9M+ Fitness" [level=2] [ref=e287]
          - generic [ref=e288]: Professionals Worldwide
        - paragraph [ref=e291]: Top-rated support from day one.
      - generic [ref=e294]:
        - img "Google logo" [ref=e295]
        - generic [ref=e296]:
          - paragraph [ref=e297]: Google Rating
          - generic [ref=e298]:
            - generic [ref=e299]: "4.9"
            - generic [ref=e300]:
              - img [ref=e301]
              - img [ref=e303]
              - img [ref=e305]
              - img [ref=e307]
              - img [ref=e309]
          - paragraph [ref=e311]: Based on 1,700+ reviews
    - generic [ref=e315]:
      - heading "Gain Credentials trusted across the industry" [level=3] [ref=e317]
      - img "A rectangular badge with the text Americas Top Online Learning Providers 2026 features the Newsweek and Statista logos, set against a blue and gold design with stars on the left side." [ref=e320]
    - generic [ref=e321]:
      - generic [ref=e325]:
        - generic [ref=e327]:
          - text: WE TRAIN THE GREATS
          - generic [ref=e328]: WHO TRAIN THE GREATS
        - paragraph [ref=e331]: The same expertise that fuels the nation’s most elite athletes is at your fingertips, too.
      - generic [ref=e333]:
        - tablist [ref=e334]:
          - tab "NFL" [selected] [ref=e335] [cursor=pointer]
          - tab "NBA" [ref=e336] [cursor=pointer]
          - tab "NHL" [ref=e337] [cursor=pointer]
          - tab "MLS" [ref=e338] [cursor=pointer]
          - tab "NWSL" [ref=e339] [cursor=pointer]
          - tab "WNBA" [ref=e340] [cursor=pointer]
          - tab "MLB" [ref=e341] [cursor=pointer]
        - tabpanel "NFL" [ref=e342]:
          - img "NFL" [ref=e345]
          - paragraph [ref=e347]: NASM-credentialed professionals are part of the performance staff for 100% of NFL teams, developing stronger, faster, more resilient athletes.
    - generic [ref=e348]:
      - generic [ref=e352]:
        - generic [ref=e354]:
          - heading "TOP OF THE CLASS." [level=2] [ref=e355]
          - generic [ref=e356]: TOP OF THEIR GAME.
        - paragraph [ref=e359]:
          - text: NASM-credentialed professionals are shaping the industry and making meaningful impacts in their communities, setting the standard for excellence.
          - text: For more, explore
          - link "NASM in Action" [ref=e360] [cursor=pointer]:
            - /url: /nasm-in-action
          - text: .
      - generic [ref=e364]:
        - generic [ref=e366]:
          - group "1 / 5" [ref=e367] [cursor=pointer]:
            - generic "Courtney" [ref=e368]:
              - generic [ref=e369]:
                - generic [ref=e370]:
                  - generic [ref=e371]: Courtney F.
                  - generic [ref=e372]: NASM CPT, WLS, CNC
                - generic:
                  - paragraph: “I am a happier person, I am a stronger person, and I am more confident since gaining all three of my certifications with NASM. I am now training thousands of women across the world. Without NASM, I wouldn't have been able to do any of this.”
          - group "2 / 5" [ref=e373] [cursor=pointer]:
            - generic "Jordan K." [ref=e374]:
              - generic [ref=e375]:
                - generic [ref=e376]:
                  - generic [ref=e377]: Jordan K.
                  - generic [ref=e378]: NASM PES, CES
                - generic:
                  - paragraph: “Given NASM’s reputation as a respected and science-driven institution, I knew these credentials would help set me apart—and they absolutely have. They’ve equipped me with tools I use daily in my work with high-level performers.”
          - group "3 / 5" [ref=e379] [cursor=pointer]:
            - generic "Jack" [ref=e380]:
              - generic [ref=e381]:
                - generic [ref=e382]:
                  - generic [ref=e383]: Jack T.
                  - generic [ref=e384]: NASM CPT
                - generic:
                  - paragraph: “Anything that you want to do in life, NASM will help you get there and help you achieve your goals. Whatever it is that you're looking to specialize in, they have the professionals to help you get there.”
          - group "4 / 5" [ref=e385] [cursor=pointer]:
            - generic "Melina S." [ref=e386]:
              - generic [ref=e387]:
                - generic [ref=e388]:
                  - generic [ref=e389]: Melina S.
                  - generic [ref=e390]: NASM CPT, CNC
                - generic:
                  - paragraph: “When I first got certified as a CPT, I felt very confident with everything I learned and very well prepared for the job. I became a CNC on top of my CPT certification in order to help my clients achieve their goals in a broader way.”
          - group "5 / 5" [ref=e391] [cursor=pointer]:
            - generic "Fred H." [ref=e392]:
              - generic [ref=e393]:
                - generic [ref=e394]:
                  - generic [ref=e395]: Fred H.
                  - generic [ref=e396]: NASM CPT
                - generic:
                  - paragraph: “NASM has taught me that the link between my physical wellbeing and my mental wellbeing is important. By balancing those two, I think it allows me to become a better trainer and mentor for a lot of the youth that I work with.”
        - generic [ref=e398]:
          - button "Go to slide 1" [ref=e399] [cursor=pointer]
          - button "Go to slide 2" [ref=e400] [cursor=pointer]
          - button "Go to slide 3" [ref=e401] [cursor=pointer]
    - generic [ref=e402]:
      - paragraph [ref=e404]:
        - generic:
          - img "training"
      - generic [ref=e406]:
        - heading "Frequently Asked Questions" [level=2] [ref=e409]
        - generic [ref=e410]:
          - generic [ref=e411]:
            - button "What makes NASM different from other credentialing programs?" [ref=e412] [cursor=pointer]
            - generic "What makes NASM different from other credentialing programs?":
              - paragraph [ref=e413]: NASM stands out for its science-based approach, industry-leading reputation, and comprehensive support system. From cutting-edge content to career resources, NASM prepares you not just to pass a test—but to thrive as a fitness professional.
          - generic [ref=e414]:
            - button "How long has NASM been certifying fitness professionals?" [ref=e415] [cursor=pointer]
            - generic "How long has NASM been certifying fitness professionals?":
              - paragraph [ref=e416]: NASM has been certifying fitness professionals for more than 35 years, earning trust and recognition across the fitness industry.
          - generic [ref=e417]:
            - button "Can the personal trainer certification be completed online?" [ref=e418] [cursor=pointer]
            - generic "Can the personal trainer certification be completed online?":
              - paragraph [ref=e419]: Yes, the NASM Certified Personal Trainer program can be completed 100% online. With interactive content, video demonstrations, and digital resources, you get a robust learning experience from anywhere, at any time.
          - generic [ref=e420]:
            - button "How long will the Certified Personal Trainer program take me?" [ref=e421] [cursor=pointer]
            - generic "How long will the Certified Personal Trainer program take me?":
              - paragraph [ref=e422]: You can complete the NASM Certified Personal Trainer program in as few as 4 to 6 weeks, depending on your schedule and pace. With flexible learning options and expert support, you’re in control of your timeline.
          - generic [ref=e423]:
            - button "How much do NASM certified personal trainers earn?*" [ref=e424] [cursor=pointer]
            - generic "How much do NASM certified personal trainers earn?*":
              - paragraph [ref=e425]:
                - text: NASM-CPT qualifies you to work as a personal trainer in gyms, studios, or independently. In the 2026 State of the Personal Trainer Survey (N = 1,133, ±2.9%, 95% confidence), NASM Certified Personal Trainers reported earning 22% more than the industry average, with new personal trainers averaging $48 an hour. To view the full report, click
                - link "here" [ref=e426] [cursor=pointer]:
                  - /url: https://2494739.fs1.hubspotusercontent-na1.net/hubfs/2494739/2026-State-of-Personal-Trainer-Report-by-NASM.pdf
                - text: .
          - generic [ref=e427]:
            - button "What is the NASM Interview Guarantee?" [ref=e428] [cursor=pointer]
            - generic "What is the NASM Interview Guarantee?":
              - paragraph [ref=e429]:
                - text: The NASM Interview Guarantee provides a guaranteed interview at a participating gym for everyone who passes the NASM-CPT Certification Exam. It is included with every NASM-CPT program at no added cost. Terms and conditions apply. The Interview Guarantee does not guarantee a job placement. Learn more about our Interview Guarantee program
                - link "here" [ref=e430] [cursor=pointer]:
                  - /url: https://support.nasm.org/interview-guarantee
                - text: .
        - paragraph [ref=e433]:
          - text: If you have any additional questions about this course, check out the
          - link "NASM FAQ" [ref=e434] [cursor=pointer]:
            - /url: https://support.nasm.org/
          - text: page or contact us today
          - link "1-800-460-6276" [ref=e435] [cursor=pointer]:
            - /url: tel:8004606276
          - text: "!"
    - generic [ref=e436]:
      - heading "Recognized by everyone." [level=3] [ref=e438]
      - list [ref=e441]:
        - listitem [ref=e442]:
          - generic:
            - generic:
              - img "lifetime fitness logo"
        - listitem [ref=e443]:
          - generic:
            - generic:
              - img "24 hours fitness logo"
        - listitem [ref=e444]:
          - generic:
            - generic:
              - img "golds gym logo"
        - listitem [ref=e445]:
          - generic:
            - generic:
              - img "hyperice logo"
        - listitem [ref=e446]:
          - generic:
            - generic:
              - img "anytime fitness logo"
        - listitem [ref=e447]:
          - generic:
            - generic:
              - img "ufc gym logo"
    - generic [ref=e448]:
      - generic [ref=e452]:
        - generic [ref=e454]:
          - text: THIS IS YOUR
          - generic [ref=e455]: STARTING LINE
        - paragraph [ref=e458]: Millions of fitness professionals started where you are. Today, they lead the industry. Now, it’s your turn.
      - generic [ref=e460]:
        - generic [ref=e461]:
          - heading "READY TO TAKE THAT FIRST STEP? LET’S CHAT." [level=2] [ref=e462]:
            - text: READY TO TAKE THAT FIRST STEP?
            - text: LET’S CHAT.
          - paragraph [ref=e464]: Fill out the form below, and we’ll be in touch within one business day.
        - generic [ref=e466]:
          - textbox [ref=e469]:
            - /placeholder: First Name*
          - textbox [ref=e472]:
            - /placeholder: Last Name*
          - textbox [ref=e475]:
            - /placeholder: Email*
          - textbox [ref=e478]:
            - /placeholder: Phone*
          - list [ref=e481]:
            - listitem [ref=e482]:
              - generic [ref=e483] [cursor=pointer]:
                - checkbox "I consent to receive SMS texts from NASM. Msg/Data rates may apply. Reply STOP to cancel." [ref=e484]
                - generic [ref=e485]: I consent to receive SMS texts from NASM. Msg/Data rates may apply. Reply STOP to cancel.
          - paragraph [ref=e488]:
            - text: By submitting this form you consent to receive recurring marketing emails and agree to our
            - link "Privacy Policy" [ref=e489] [cursor=pointer]:
              - /url: https://auth.nasm.org/policy.html
            - text: . You may unsubscribe at any time.
          - button "Submit" [ref=e492] [cursor=pointer]
        - generic [ref=e493]:
          - paragraph [ref=e494]: "Can’t wait? Call now to speak with a program advisor instantly:"
          - paragraph [ref=e495]:
            - link "1.800.460.6276" [ref=e496] [cursor=pointer]:
              - /url: tel:8004606276
  - contentinfo [ref=e497]:
    - generic [ref=e499]:
      - generic [ref=e500]:
        - generic [ref=e502]:
          - img "NASM Logo" [ref=e506]
          - list [ref=e509]:
            - listitem [ref=e510]:
              - link "Instagram" [ref=e511] [cursor=pointer]:
                - /url: https://www.instagram.com/nasmfitness/
                - img "Instagram" [ref=e512]
            - listitem [ref=e513]:
              - link "YouTube" [ref=e514] [cursor=pointer]:
                - /url: https://www.youtube.com/channel/UCjWgUFeyDbeQ3Q_eVCup_7Q
                - img "YouTube" [ref=e515]
            - listitem [ref=e516]:
              - link "X" [ref=e517] [cursor=pointer]:
                - /url: https://x.com/NASM
                - img "X" [ref=e518]
            - listitem [ref=e519]:
              - link "TikTok" [ref=e520] [cursor=pointer]:
                - /url: https://www.tiktok.com/@nasmfitness
                - img "TikTok" [ref=e521]
            - listitem [ref=e522]:
              - link "Facebook" [ref=e523] [cursor=pointer]:
                - /url: https://www.facebook.com/personaltrainers/
                - img "Facebook" [ref=e524]
          - generic [ref=e526]:
            - paragraph [ref=e527]:
              - link "1.800.460.6276" [ref=e528] [cursor=pointer]:
                - /url: tel:18004606276
            - paragraph [ref=e529]: 355 E. Germann Rd Ste. 201,
            - paragraph [ref=e530]: Gilbert, AZ 85297
        - navigation "Footer navigation" [ref=e533]:
          - generic [ref=e534]:
            - button "Shop" [expanded]
            - region "Shop" [ref=e535]:
              - link "Certified Personal Trainer" [ref=e536] [cursor=pointer]:
                - /url: https://www.nasm.org/products/become-a-personal-trainer
              - link "Nutrition & Wellness" [ref=e537] [cursor=pointer]:
                - /url: https://www.nasm.org/nasm?focus=Nutrition%2CWellness
              - link "NASM One Membership" [ref=e538] [cursor=pointer]:
                - /url: https://www.nasm.org/membership
              - link "Specializations" [ref=e539] [cursor=pointer]:
                - /url: https://www.nasm.org/nasm?course_type=Specialization
              - link "Course Bundles" [ref=e540] [cursor=pointer]:
                - /url: https://www.nasm.org/search?sort=relevance&sortDirection=desc&q=bundles
              - link "Apparel" [ref=e541] [cursor=pointer]:
                - /url: https://sideline.bsnsports.com/schools/arizona/gilbert/national-academy-of-sports-medicine
          - generic [ref=e542]:
            - button "About" [expanded]
            - region "About" [ref=e543]:
              - link "About NASM" [ref=e544] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm
              - link "NASM Support" [ref=e545] [cursor=pointer]:
                - /url: https://support.nasm.org/
              - link "Contact Us" [ref=e546] [cursor=pointer]:
                - /url: https://www.nasm.org/contact-us
              - link "Press" [ref=e547] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm/nasm-news-pressroom
              - link "Accreditation" [ref=e548] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm/accreditation
              - link "NASM Careers" [ref=e549] [cursor=pointer]:
                - /url: https://ascendlearning.jobs.hr.cloud.sap/
              - link "Military Discounts" [ref=e550] [cursor=pointer]:
                - /url: https://www.nasm.org/certified-personal-trainer/military-support
          - generic [ref=e551]:
            - button "Trainer Resources" [expanded]
            - region "Trainer Resources" [ref=e552]:
              - link "Job Board" [ref=e553] [cursor=pointer]:
                - /url: https://www.nasmjobs.com/
              - link "Pro Discounts" [ref=e554] [cursor=pointer]:
                - /url: https://www.nasm.org/discountpartners
              - link "Insurance" [ref=e555] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/insurance
              - link "Digital Badges" [ref=e556] [cursor=pointer]:
                - /url: https://www.nasm.org/digital-badges
              - link "Validate Credentials" [ref=e557] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/validate-credentials
              - link "Recertification" [ref=e558] [cursor=pointer]:
                - /url: https://www.nasm.org/products/nasm-recertification-and-renewal-information
              - link "Candidate Handbook" [ref=e559] [cursor=pointer]:
                - /url: https://2494739.fs1.hubspotusercontent-na1.net/hubfs/2494739/NASM%20Candidate%20Handbook%202026.pdf
          - generic [ref=e560]:
            - button "Partners & Brands" [expanded]
            - region "Partners & Brands" [ref=e561]:
              - link "Partner With NASM" [ref=e562] [cursor=pointer]:
                - /url: https://www.nasm.org/about-nasm/partnerships
              - link "Academic Partners" [ref=e563] [cursor=pointer]:
                - /url: https://www.nasm.org/academic
              - link "International Partners" [ref=e564] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/international-partners
              - link "Find a Partner School" [ref=e565] [cursor=pointer]:
                - /url: https://www.nasm.org/academic/featured-schools
              - link "Course Providers" [ref=e566] [cursor=pointer]:
                - /url: https://www.nasm.org/resources/preferred-providers
              - link "AFAA" [ref=e567] [cursor=pointer]:
                - /url: https://www.afaa.com/?__hstc=17162406.4e2e605ba230db9d949e827f1bdb39ec.1759500538529.1761240984269.1761249852792.77&__hssc=17162406.24.1761249852792&__hsfp=2619848739
              - link "ClubConnect" [ref=e568] [cursor=pointer]:
                - /url: https://www.clubconnect.com/
          - status [ref=e569]
        - list [ref=e571]:
          - listitem [ref=e572]: Start Training. Start Training. Start Training. Start Training. Start Training. Start Training. Start Training. Start Training. Start Training.
      - generic [ref=e577]:
        - paragraph [ref=e578]: Copyright © 2026 National Academy of Sports Medicine, LLC. All rights reserved.
        - list [ref=e579]:
          - listitem [ref=e580]:
            - link "Privacy Policy" [ref=e581] [cursor=pointer]:
              - /url: https://auth.nasm.org/policy.html
            - text: /
          - listitem [ref=e582]:
            - link "Notice for California Residents" [ref=e583] [cursor=pointer]:
              - /url: https://auth.nasm.org/policy.html#privacy_information_ca
            - text: /
          - listitem [ref=e584]:
            - link "Website Terms of Use" [ref=e585] [cursor=pointer]:
              - /url: https://auth-platformtraining.ascendlearning.com/website_terms.html
            - text: /
          - listitem [ref=e586]:
            - link "Terms & Conditions" [ref=e587] [cursor=pointer]:
              - /url: https://auth.nasm.org/terms.html
            - text: /
          - listitem [ref=e588]:
            - link "Your Privacy Choices" [ref=e589] [cursor=pointer]:
              - /url: "#"
        - paragraph [ref=e590]:
          - text: This site is protected by reCAPTCHA and the
          - link "Google Privacy Policy" [ref=e591] [cursor=pointer]:
            - /url: https://policies.google.com/privacy
          - text: and
          - link "Terms of Service" [ref=e592] [cursor=pointer]:
            - /url: https://policies.google.com/terms
          - text: apply.
      - generic [ref=e594]:
        - generic [ref=e596]:
          - generic [ref=e597]:
            - group "1 / 3" [ref=e598]:
              - generic [ref=e599]:
                - link "Job by January Sale | Save up to 60%" [ref=e600] [cursor=pointer]:
                  - /url: https://www.nasm.org/nasm?show_only=On+Sale
                  - strong [ref=e601]: Job by January Sale | Save up to 60%
                - generic [ref=e603]:
                  - generic [ref=e604]:
                    - generic [ref=e605]: "00"
                    - generic [ref=e606]: Days
                  - generic [ref=e607]:
                    - generic [ref=e608]: "15"
                    - generic [ref=e609]: Hours
                  - generic [ref=e610]:
                    - generic [ref=e611]: "46"
                    - generic [ref=e612]: Min
                  - generic [ref=e613]:
                    - generic [ref=e614]: "42"
                    - generic [ref=e615]: Sec
            - group "2 / 3" [ref=e616]:
              - link "GLP‑1s are Changing Fitness. Stay Ahead with Our Updated Course!" [ref=e618] [cursor=pointer]:
                - /url: https://www.nasm.org/products/understanding-weight-loss-medications
            - group "3 / 3" [ref=e619]:
              - generic [ref=e620]:
                - generic [ref=e621]: "Phone-Only: Free Gift With Any CPT Purchase"
                - button "Call Now (844) 902-6489" [ref=e622] [cursor=pointer]:
                  - strong [ref=e623]: Call Now
                  - text: (844) 902-6489
          - button "Previous slide" [ref=e624] [cursor=pointer]: prev
          - button "Next slide" [ref=e625] [cursor=pointer]: next
        - text: prev next
  - dialog "Consent Banner" [ref=e626]:
    - generic [ref=e627]:
      - generic [ref=e629]:
        - text: We value your privacy and respect your preferences. We allow certain online advertising partners to collect information from our services (e.g., device identifiers and usage information) through technologies such as cookies and pixels to deliver ads that are more relevant to you and assist us with related analytics activities. This may be considered "selling" or "sharing/processing” for targeted online advertising under applicable law. To opt out of these activities, please click "Manage". Please read our
        - link "Privacy Policy" [ref=e631] [cursor=pointer]:
          - /url: https://auth.nasm.org/policy.html
        - text: to learn about all of our data processing activities and your choices.
      - generic [ref=e632]:
        - button "Manage" [ref=e633] [cursor=pointer]
        - button "Okay" [ref=e634] [cursor=pointer]
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