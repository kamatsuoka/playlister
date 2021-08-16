export const tableOverrides = {
  Table: {
    style: ({ $theme }) => ({
      minWidth: `calc(3.5 * ${$theme.sizing.scale4800})`
    })
  },
  TableHeadCell: {
    style: ({ $theme }) => ({
      paddingLeft: $theme.sizing.scale200,
      paddingRight: $theme.sizing.scale200,
      verticalAlign: 'middle'
    })
  },
  TableBodyRow: {
    style: ({ $theme, $rowIndex }) => ({
      backgroundColor:
        $rowIndex % 2
          ? $theme.colors.backgroundPrimary
          : $theme.colors.backgroundSecondary,
      ':hover': {
        backgroundColor: $theme.colors.backgroundTertiary
      }
    })
  },
  TableBodyCell: {
    style: ({ $theme }) => ({
      paddingLeft: $theme.sizing.scale200,
      paddingRight: $theme.sizing.scale200,
      paddingTop: $theme.sizing.scale200,
      paddingBottom: $theme.sizing.scale200,
      verticalAlign: 'middle'
    })
  }
}

export const withCellStyle = styleProps => ({
  TableHeadCell: {
    style: ({ $theme }) => ({
      ...tableOverrides.TableHeadCell.style({ $theme }),
      ...styleProps({ $theme })
    })
  },
  TableBodyCell: {
    style: ({ $theme }) => ({
      ...tableOverrides.TableBodyCell.style({ $theme }),
      ...styleProps({ $theme })
    })
  },
  TableBodyRow: tableOverrides.TableBodyRow
})

/*
const StyledBodyCell = withStyle(StyledTableBodyCell, ({ $theme }) => {
  const tablePadding = $theme.sizing.scale200
  return ({
    paddingLeft: tablePadding,
    paddingRight: tablePadding,
    paddingTop: tablePadding,
    paddingBottom: tablePadding,
    verticalAlign: 'middle'
  })
})
*/
