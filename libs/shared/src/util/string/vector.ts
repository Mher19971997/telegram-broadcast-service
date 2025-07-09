export const makeVector = (val: string, startFrom: number) =>
  val
    .split(' ')
    .flatMap(
      (val) =>
        (
          val.length > startFrom &&
          val.split('').reduce(
            (acc, sVal, index, rc) => {
              acc.sgm.push(sVal);
              if (index >= startFrom || rc.length < startFrom) {
                acc.res.push(acc.sgm.join(''));
              }
              return acc;
            },
            { res: [], sgm: [] },
          )
        )?.res || val,
    )
    .join(' ');
