import config from '@documenso/tailwind-config';

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '../components';
import { TemplateFooter } from '../template-components/template-footer';
import TemplateImage from '../template-components/template-image';

export type PayrollInviteEmailProps = {
  assetBaseUrl: string;
  baseUrl: string;
  senderName: string;
  payrollTitle: string;
  currency: string;
  token: string;
  documentTitle: string;
  documentId: number;
  amount: number;
};

export const PayrollInviteEmailTemplate = ({
  assetBaseUrl = 'http://localhost:3002',
  baseUrl = 'https://emplying.com',
  senderName = 'John Doe',
  payrollTitle = 'Payroll Title',
  currency,
  token = '',
  documentTitle,
  documentId,
  amount,
}: PayrollInviteEmailProps) => {
  const previewText = `Accept invitation to join a payroll on Emplying`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: config.theme.extend.colors,
            },
          },
        }}
      >
        <Body className="mx-auto my-auto font-sans">
          <Section className="bg-white text-slate-500">
            <Container className="mx-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-2 backdrop-blur-sm">
              <TemplateImage
                assetBaseUrl={assetBaseUrl}
                className="mb-4 h-6 p-2"
                staticAsset="logo.png"
              />

              <Section>
                <TemplateImage
                  className="mx-auto"
                  assetBaseUrl={assetBaseUrl}
                  staticAsset="add-user.png"
                />
              </Section>

              <Section className="p-2 text-slate-500">
                <Text className="text-center text-lg font-medium text-black">
                  Join {payrollTitle} on Emplying
                </Text>

                <Text className="my-1 text-center text-base">
                  To fulfill the obligations of signed document
                </Text>

                <div className="mx-auto my-2 w-fit rounded-lg bg-gray-50 px-4 py-2 text-base font-medium text-slate-600">
                  {documentTitle}
                </div>

                <Text className="my-1 text-center text-base">
                  <span className="text-slate-900">{senderName}</span> has invited you to join
                  payroll
                </Text>

                <div className="mx-auto my-2 w-fit rounded-lg bg-gray-50 px-4 py-2 text-base font-medium text-slate-600">
                  {payrollTitle}
                </div>

                <Text className="my-1 text-center text-base">with an amount of</Text>

                <div className="mx-auto my-2 w-fit rounded-lg bg-gray-50 px-4 py-2 text-base font-medium text-slate-600">
                  {amount} {currency}
                </div>

                <Section className="mb-6 mt-6 text-center">
                  <Button
                    className="inline-flex items-center justify-center rounded-lg bg-gray-200 px-6 py-3 text-center text-sm font-medium text-black no-underline"
                    href={`${baseUrl}/documents/${documentId}`}
                  >
                    View Document
                  </Button>
                </Section>

                <Section className="mb-6 mt-6 text-center">
                  <Button
                    className="bg-documenso-500 inline-flex items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-medium text-black no-underline"
                    href={`${baseUrl}/payroll/invite/${token}`}
                  >
                    Accept
                  </Button>
                </Section>
              </Section>
            </Container>

            <Hr className="mx-auto mt-12 max-w-xl" />

            <Container className="mx-auto max-w-xl">
              <TemplateFooter isDocument={false} />
            </Container>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PayrollInviteEmailTemplate;
