import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import IosShareIcon from '@mui/icons-material/IosShare';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PortableText } from '@portabletext/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import CalcStepper from '../../components/functional/CalcStepper.tsx';
import externalLinks from '../../components/functional/ExternalLinks.tsx';
import MailchimpForm from '../../components/functional/MailchimpForm.tsx';
import IndividualPageHead from '../../components/helper/IndividualPageHead.tsx';
import Results from '../../components/helper/Results.tsx';
import ShareButtons from '../../components/helper/ShareButtons.tsx';
import portableTextComponents from '../../utils/portableTextComponents.tsx';
import {
  getCalculatorConfig,
  getCalculatorPageBySlug,
  getCalculatorPagePaths,
} from '../../utils/sanity.client.ts';

function CalcHeader({ page, isFirstPage }) {
  const router = useRouter();

  const isPageIncludedInStepper = () => {
    const excludedPageSlug = 'head';
    const isPartOfHead = page.slug.includes(excludedPageSlug); // exclude
    const { isFinalPage } = page; // exclude
    return !(isFinalPage || isPartOfHead);
  };

  return (
    <Container id="stepper-container" sx={{ marginTop: '2rem' }}>

      {!isFirstPage(page) && (
        <Button
          type="button"
          id="back-button"
          onClick={() => {
            router.back();
          }}
          sx={{
            marginLeft: 0,
            fontWeight: 'normal',
            fontSize: '14px',
            color: 'primary',
          }}
        >
          <SvgIcon
            sx={{ marginRight: '10px' }}
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
          >
            <path
              d="M11.8341 1.8701L10.0541 0.100098L0.164062 10.0001L10.0641 19.9001L11.8341 18.1301L3.70406 10.0001L11.8341 1.8701Z"
              fill="#4e6c99"
            />
          </SvgIcon>
          previous
        </Button>
      )}

      {isPageIncludedInStepper(page) && <CalcStepper />}

    </Container>
  );
}

function QandASection({
  page, calculatorConfig, addToResponses, setOpen,
}) {
  return (
    <>
      <Box mb={4}>
        <PortableText
          value={page.content}
          components={portableTextComponents}
        />
      </Box>

      <Container maxWidth="xs" sx={{ mb: 4 }}>
        <Stack gap={2}>
          {page.choices
          && page.choices.map((choice) => {
            const linkTo = choice.linkTo
              ? `/calculator/${choice.linkTo.slug.current}`
              : '#';
            const href = choice.isExternalLink ? choice.url : linkTo;
            return (
              <Button
                key={choice._key}
                variant="contained"
                color="primary"
                href={href}
                sx={{ width: '100%' }}
                onClick={() => addToResponses(choice.label)}
              >
                {choice.label}
              </Button>
            );
          })}

          {page.isQuestion && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ width: '100%' }}
            onClick={() => setOpen(true)}
          >
            {calculatorConfig.notSureAnswer.promptText}
          </Button>
          )}
        </Stack>
      </Container>
    </>
  );
}

function CheckAnotherConvictionSection({ calculatorConfig }) {
  return (
    <Link
      sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}
      href={
        calculatorConfig.checkAnotherConviction.linkTo.slug.current
          }
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
        }}
      >
        <HistoryIcon />
        {calculatorConfig.checkAnotherConviction.linkText}
      </Box>
    </Link>
  );
}

function FeedbackButtonSection({ page, calculatorConfig }) {
  return (
    <Button
      variant="contained"
      color="primary"
      href={
        page.isUndetermined
          ? calculatorConfig.feedback.isUndeterminedUrl
          : calculatorConfig.feedback.allOtherFeedbackUrl
            }
    >
      {calculatorConfig.feedback.linkText}
    </Button>
  );
}

function ShareCalculatorSection({ setShare, calcFirstPageUrl }) {
  return (
    <Link
      href={calcFirstPageUrl}
      onClick={(event) => {
        event.preventDefault();
        setShare(true);
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
        }}
      >
        <IosShareIcon />
        Share the calculator
      </Box>
    </Link>
  );
}

function FinalPageLinks({
  page, calculatorConfig, setShare, calcFirstPageUrl,
}) {
  const theme = useTheme();
  const matchesXS = useMediaQuery(theme.breakpoints.down('sm'));

  if (page.isFinalPage) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: matchesXS ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}
      >
        <FeedbackButtonSection page={page} calculatorConfig={calculatorConfig} />
        <Box>
          <CheckAnotherConvictionSection calculatorConfig={calculatorConfig} />
          <ShareCalculatorSection setShare={setShare} calcFirstPageUrl={calcFirstPageUrl} />
        </Box>
      </Box>
    );
  }
}

function DownloadResultsSection({ page, handleClose, setShowResults }) {
  const saveAsPDF = async () => {
    /* eslint new-cap: ["error", { "newIsCap": false }] */
    const pdf = new jsPDF('portrait', 'pt', 'a4');
    const data1 = await html2canvas(document.querySelector('#firstPage'));
    const img1 = data1.toDataURL('image/png');
    const imgProperties1 = pdf.getImageProperties(img1);
    const pdfWidth1 = pdf.internal.pageSize.getWidth();
    const pdfHeight1 = (imgProperties1.height * pdfWidth1) / imgProperties1.width;

    const data2 = await html2canvas(document.querySelector('#results-page'));
    const img2 = data2.toDataURL('image/png');
    const imgProperties2 = pdf.getImageProperties(img2);
    const pdfWidth2 = pdf.internal.pageSize.getWidth();
    const pdfHeight2 = (imgProperties2.height * pdfWidth2) / imgProperties2.width;

    pdf.addImage(img1, 'PNG', 0, 0, pdfWidth1, pdfHeight1);
    pdf.addPage('portrait', 'pt', 'a4');
    pdf.addImage(img2, 'PNG', 0, 0, pdfWidth2, pdfHeight2);

    pdf.save('clearviction_calc_results.pdf');
    if (window.innerWidth < 901) handleClose();
  };

  const handleDownloadClick = () => {
    // print section must be on the page before save as pdf will work
    setShowResults(true);
    setTimeout(() => { saveAsPDF(); }, 500);
  };

  if (page.isFinalPage && page.isEligible) {
    return (
      <Button
        sx={{ display: 'block' }}
        onClick={() => handleDownloadClick()}
      >
        Download responses
      </Button>
    );
  }
}

function ReportErrorSection({ calculatorConfig }) {
  return (
    <Link
      href={calculatorConfig.errorReportingForm.errorReportingFormUrl}
      sx={{
        textAlign: 'center',
        color: 'text.primary',
        textDecoration: 'none',
        '&:hover': {
          color: 'primary.main',
          textDecoration: 'underline',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '.8rem',
          gap: 1,
        }}
      >
        {calculatorConfig.errorReportingForm.linkText}
        {' '}
      </Box>
    </Link>
  );
}

function FirstPageShareButton({
  setShare, calcFirstPageUrl, isFirstPage,
}) {
  if (isFirstPage()) {
    return (
      <Link
        href={calcFirstPageUrl}
        onClick={(event) => {
          event.preventDefault();
          setShare(true);
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '1.28rem',
            gap: 0.5,
          }}
        >
          <IosShareIcon />
          Share the calculator
        </Box>
      </Link>
    );
  }
}

function NotSurePopup({ calculatorConfig, open, setOpen }) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {calculatorConfig.notSureAnswer.header}
      </DialogTitle>
      <DialogContent>
        <PortableText
          value={calculatorConfig.notSureAnswer.content}
          components={portableTextComponents}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>
          {calculatorConfig.notSureAnswer.closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ShareCalculatorPopup({ share, setShare }) {
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const popup = true;

  const closeDialog = () => {
    setTimeout(() => {
      setShare(false);
    }, 10);

    setTimeout(() => {
      setShareLinkCopied(false);
    }, 350);
  };

  return (
    <Dialog
      open={share}
      onClose={() => closeDialog()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <CloseIcon
        edge="end"
        color="inherit"
        onClick={() => closeDialog()}
        aria-label="close"
        style={{
          position: 'absolute', top: '.625rem', right: '.625rem',
        }}
      />
      <ShareButtons
        popup={popup}
        setShareLinkCopied={setShareLinkCopied}
        shareLinkCopied={shareLinkCopied}
      />
    </Dialog>
  );
}

export default function CalculatorSlugRoute({ page, calculatorConfig }) {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState(false);
  const [responseObject, setResponseObject] = useState({});
  const [showResults, setShowResults] = useState(false);

  const calcFirstPageUrl = 'https://clearviction.org/calculator/head-initial-1-cont';
  const isFirstPage = () => page.slug === 'head-initial-1-cont';

  const addToResponses = (answer) => {
    // delete object when start over
    if (page.slug === 'head-initial-1-cont') setResponseObject({});
    if (answer !== 'Continue' && answer !== 'Next' && answer !== 'Start' && page.slug !== 'head-mis-3-cont') {
      responseObject[page.slug] = answer;
    }
  };

  const handleClose = () => {
    setShowResults(false);
  };

  externalLinks();

  return (
    <>
      <IndividualPageHead
        title="Check the eligibility to vacate your misdemeanor"
        metaContent="Determine if your misdemeanor or gross misdemeanor is eligible to vacate in Washington State with Clearviction's eligibility calculator."
      />

      <CalcHeader page={page} isFirstPage={isFirstPage} />

      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        id="calculator-container-outer"
      >

        <QandASection
          page={page}
          calculatorConfig={calculatorConfig}
          addToResponses={addToResponses}
          setOpen={setOpen}
        />

        <FinalPageLinks
          page={page}
          calculatorConfig={calculatorConfig}
          setShare={setShare}
          calcFirstPageUrl={calcFirstPageUrl}
        />

        {page.isFinalPage && (
          <Box maxWidth="60ch" textAlign="center">
            <Typography variant="caption" sx={{ fontWeight: 'light' }}>
              {calculatorConfig.legalDisclaimer}
            </Typography>
          </Box>
        )}

        <DownloadResultsSection
          page={page}
          handleClose={handleClose}
          setShowResults={setShowResults}
        />

        {page.isEligible && showResults && (
          <Results responseObject={responseObject} handleClose={handleClose} />
        )}

        {page.isEligible && <MailchimpForm />}
      </Container>

      <NotSurePopup calculatorConfig={calculatorConfig} open={open} setOpen={setOpen} />

      <ShareCalculatorPopup share={share} setShare={setShare} />

      <Box
        sx={{
          textAlign: 'center',
          mb: '1.875rem',
          color: 'black',
          fontWeight: 500,
          fontSize: '1rem',
        }}
      >
        <FirstPageShareButton
          setShare={setShare}
          calcFirstPageUrl={calcFirstPageUrl}
          isFirstPage={isFirstPage}
        />

        <ReportErrorSection calculatorConfig={calculatorConfig} />
      </Box>
    </>
  );
}

export async function getStaticProps(ctx) {
  const { params = {} } = ctx;

  const [page, calculatorConfig] = await Promise.all([
    getCalculatorPageBySlug({ slug: params.slug }),
    getCalculatorConfig(),
  ]);

  if (!page) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      page,
      calculatorConfig,
    },
  };
}

export async function getStaticPaths() {
  const paths = await getCalculatorPagePaths();

  return {
    paths: paths?.map((slug) => `/calculator/${slug}`) || [],
    fallback: false,
  };
}

CalculatorSlugRoute.propTypes = {
  page: PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.shape({
      current: PropTypes.string.isRequired,
      includes: PropTypes.func.isRequired,
    }).isRequired,
    content: PropTypes.arrayOf(
      PropTypes.shape({
        _key: PropTypes.string.isRequired,
        _type: PropTypes.string.isRequired,
      }),
    ).isRequired,
    choices: PropTypes.arrayOf(
      PropTypes.shape({
        _key: PropTypes.string.isRequired,
        _type: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        linkTo: PropTypes.shape({
          slug: PropTypes.shape({
            current: PropTypes.string.isRequired,
          }).isRequired,
        }),
        isExternalLink: PropTypes.bool,
        url: PropTypes.string,
      }),
    ),
    isQuestion: PropTypes.bool,
    isFinalPage: PropTypes.bool,
    isEligible: PropTypes.bool,
    isUndetermined: PropTypes.bool,
  }).isRequired,
  calculatorConfig: PropTypes.shape({
    legalDisclaimer: PropTypes.string.isRequired,
    feedback: PropTypes.shape({
      linkText: PropTypes.string.isRequired,
      allOtherFeedbackUrl: PropTypes.string.isRequired,
      isUndeterminedUrl: PropTypes.string.isRequired,
    }).isRequired,
    checkAnotherConviction: PropTypes.shape({
      linkText: PropTypes.string.isRequired,
      linkTo: PropTypes.shape({
        slug: PropTypes.shape({
          current: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    errorReportingForm: PropTypes.shape({
      linkText: PropTypes.string.isRequired,
      errorReportingFormUrl: PropTypes.string.isRequired,
    }).isRequired,
    notSureAnswer: PropTypes.shape({
      header: PropTypes.string.isRequired,
      promptText: PropTypes.string.isRequired,
      content: PropTypes.arrayOf(
        PropTypes.shape({
          _key: PropTypes.string.isRequired,
          _type: PropTypes.string.isRequired,
        }),
      ).isRequired,
      closeText: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
