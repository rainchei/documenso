export type TeamPayrollPageProps = {
  params: {
    id: string;
    teamUrl: string;
  };
};

export default function TeamPayrollPage({ params }: TeamPayrollPageProps) {
  const { id, teamUrl } = params;

  return (
    <p>
      This is PayrollPage {id} on {teamUrl}.
    </p>
  );
}
