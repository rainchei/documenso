export type PayrollPageProps = {
  params: {
    id: string;
  };
};

export default function PayrollPage({ params }: PayrollPageProps) {
  const { id } = params;

  return <p>This is PayrollPage {id}.</p>;
}
