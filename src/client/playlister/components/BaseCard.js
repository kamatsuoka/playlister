import { Card } from 'baseui/card'

export const BaseCard = ({ children, title }) => {
  return (
    <Card
      overrides={{
        Root: {
          style: ({ $theme }) => ({
            marginTop: '20px',
            marginBottom: '20px'
          })
        },
        Title: {
          style: ({ $theme }) => ({
            ...$theme.typography.LabelMedium
          })
        }
      }}
      title={title}
    >
      {children}
    </Card>
  )
}
