# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to main content" [ref=e3]:
    - /url: "#main-content"
  - region "Notifications (F8)":
    - list
  - main [ref=e4]:
    - generic [ref=e7]:
      - generic [ref=e9]:
        - paragraph [ref=e10]:
          - generic [ref=e11]: "Quiz progress:"
          - text: Question 1 of 15
        - 'progressbar "Quiz progress: question 1 of 15" [ref=e12]'
      - generic [ref=e15]:
        - generic [ref=e16]:
          - paragraph [ref=e17]: UX Fundamentals
          - heading "How often do you test your designs for accessibility (WCAG compliance, etc.)?" [level=2] [ref=e18]
        - radiogroup "How often do you test your designs for accessibility (WCAG compliance, etc.)?" [ref=e19]:
          - radio "Never" [ref=e20] [cursor=pointer]:
            - generic [ref=e22]: Never
          - radio "Rarely" [ref=e23] [cursor=pointer]:
            - generic [ref=e25]: Rarely
          - radio "Sometimes, but not systematically" [ref=e26] [cursor=pointer]:
            - generic [ref=e28]: Sometimes, but not systematically
          - radio "Often, for critical features" [ref=e29] [cursor=pointer]:
            - generic [ref=e31]: Often, for critical features
          - radio "Always, it's part of my process" [ref=e32] [cursor=pointer]:
            - generic [ref=e34]: Always, it's part of my process
      - generic [ref=e35]:
        - button "Back to Home" [ref=e36] [cursor=pointer]:
          - img
          - text: Back to Home
        - generic [ref=e37]: Select an answer to continue
```