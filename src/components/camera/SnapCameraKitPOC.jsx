import React from "react";
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

// Legacy Snap Camera Kit POC component - DEPRECATED
// This component has been replaced with 8th Wall WebAR integration
// See EighthWallCamera component for the new implementation

const SnapCameraKitPOC = () => {
  return (
    <Box p={8} maxW="container.md" mx="auto">
      <Alert status="warning" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>Component Deprecated!</AlertTitle>
          <AlertDescription>
            This Snap Camera Kit POC has been replaced with 8th Wall WebAR
            integration. Please use the new EighthWallCamera component and
            wedding filters instead.
          </AlertDescription>
        </Box>
      </Alert>

      <Button
        leftIcon={<ArrowLeft />}
        onClick={() => window.history.back()}
        colorScheme="pink"
      >
        Go Back
      </Button>
    </Box>
  );
};

export default SnapCameraKitPOC;
