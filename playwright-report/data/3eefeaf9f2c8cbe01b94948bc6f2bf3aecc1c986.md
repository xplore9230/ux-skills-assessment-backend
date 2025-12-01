# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to main content" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - region "Notifications (F8)":
    - list
  - main [ref=e4]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - paragraph [ref=e9]:
          - generic [ref=e10]: "Quiz progress:"
          - text: Question 1 of 15
        - 'progressbar "Quiz progress: question 1 of 15" [ref=e11]'
      - generic [ref=e14]:
        - generic [ref=e15]:
          - paragraph [ref=e16]: UI Craft & Visual Design
          - heading "How would you rate your skills in layout, spacing, and visual hierarchy?" [level=2] [ref=e17]
        - radiogroup "How would you rate your skills in layout, spacing, and visual hierarchy?" [ref=e18]:
          - radio "Weak, my designs often feel cluttered or misaligned" [ref=e19] [cursor=pointer]:
            - generic [ref=e21]: Weak, my designs often feel cluttered or misaligned
          - radio "Basic, I can follow existing patterns" [ref=e22] [cursor=pointer]:
            - generic [ref=e24]: Basic, I can follow existing patterns
          - radio "Decent, I can make things look 'good enough'" [ref=e25] [cursor=pointer]:
            - generic [ref=e27]: Decent, I can make things look 'good enough'
          - radio "Strong, I can craft polished clean UIs" [ref=e28] [cursor=pointer]:
            - generic [ref=e30]: Strong, I can craft polished clean UIs
          - radio "Very strong, I obsess over details, grids, and spacing" [ref=e31] [cursor=pointer]:
            - generic [ref=e33]: Very strong, I obsess over details, grids, and spacing
      - generic [ref=e34]:
        - button "Back to Home" [ref=e35] [cursor=pointer]:
          - img
          - text: Back to Home
        - generic [ref=e36]: Select an answer to continue
```