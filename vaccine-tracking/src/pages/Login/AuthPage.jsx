import React, { useState } from "react";
import {
  CssVarsProvider,
  extendTheme,
} from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../config/axios";
import { message } from "antd"; 

const customTheme = extendTheme({ defaultColorScheme: "dark" });

export default function AuthPage() {
  const [authMode, setAuthMode] = React.useState("signin");
  const navigate = useNavigate();

  const toggleAuthMode = (mode) => {
    setAuthMode(mode);
  };

  const CompanyLogoButton = () => (
    <IconButton sx={{ padding: 2, width: 64, height: 64 }}>
      <img
        src="https://content.govdelivery.com/attachments/fancy_images/USVHA/2021/01/4005196/covid-vaccine-01_original.png"
        alt=""
        style={{
          width: 64,
          height: 64,
          objectFit: "contain",
        }}
      />
    </IconButton>
  );

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElements = event.currentTarget.elements;
    let data;
    switch (authMode) {
      case "signin":
        data = {
          email: formElements.email.value,
          password: formElements.password.value,
          persistent: formElements.persistent?.checked,
        };
        try {
          const response = await api.post("/api/Auth/authenticate", {
            email: data.email,
            password: data.password,
          });

          const { id, name, email, roleId, token } = response.data;

          localStorage.setItem("token", token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id,
              name,
              email,
              roleId,
            })
          );
          localStorage.setItem("accountId", id);
          localStorage.setItem("roleId", roleId);

          message.success("Đăng nhập thành công!");
          navigate("/");
        } catch (err) {
          console.error(err);
          message.error(err.response?.data || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
        }
        break;
      case "signup":
        data = {
          name: formElements.name.value,
          email: formElements.email.value,
          password: formElements.password.value,
          confirmPassword: formElements.confirmPassword.value,
          phone: formElements.phone.value,
          address: formElements.address.value,
        };
        try {
          const response = await api.post("/api/Auth/register", {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            address: data.address,
          });
          console.log("Registration successful", response.data);
      
          message.success("Đăng ký thành công!");
        } catch (error) {
          console.error("Registration failed", error.response.data);
          
          message.error(error.response?.data || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
        }
        break;
    }
  };

  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0.4s",
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: "100%", md: "50vw" },
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255 255 255 / 0.2)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundColor: "rgba(19 19 24 / 0.4)",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            width: "100%",
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{ py: 3, display: "flex", justifyContent: "space-between" }}
          >
            <Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
              <Button
                variant="plain"
                startDecorator={<CompanyLogoButton />}
                size="lg"
                color="neutral"
                onClick={handleHomeClick}
              >
              </Button>
            </Box>
            <ColorSchemeToggle />
          </Box>
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 400,
              maxWidth: "100%",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  {authMode === "signin" ? "Sign in" : "Sign up"}
                </Typography>
                <Typography level="body-sm">
                  {authMode === "signin"
                    ? "Don't have an account yet? "
                    : "Already have an account? "}
                  <Link
                    component="button"
                    level="title-sm"
                    onClick={() =>
                      toggleAuthMode(authMode === "signin" ? "signup" : "signin")
                    }
                  >
                    {authMode === "signin" ? "Sign up!" : "Sign in!"}
                  </Link>
                </Typography>
              </Stack>
            </Stack>
            <Stack sx={{ gap: 4, mt: 2 }}>
              <form onSubmit={handleSubmit}>
                {authMode === "signup" && (
                  <FormControl required>
                    <FormLabel>Name</FormLabel>
                    <Input type="text" name="name" />
                  </FormControl>
                )}
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" />
                </FormControl>
                <FormControl required>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" name="password" />
                </FormControl>
                {authMode === "signup" && (
                  <FormControl required>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input type="password" name="confirmPassword" />
                  </FormControl>
                )}
                {authMode === "signup" && (
                  <FormControl required>
                    <FormLabel>Phone</FormLabel>
                    <Input type="text" name="phone" />
                  </FormControl>
                )}
                {authMode === "signup" && (
                  <FormControl required>
                    <FormLabel>Address</FormLabel>
                    <Input type="text" name="address" />
                  </FormControl>
                )}

                <Stack sx={{ gap: 4, mt: 2 }}>
                  {authMode === "signin" && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        label="Remember me"
                        name="persistent"
                      />
                    </Box>
                  )}
                  {authMode === "signup" && (
                    <Checkbox
                      size="sm"
                      label="I agree to the terms and conditions"
                      name="terms"
                    />
                  )}
                  <Button type="submit" fullWidth>
                    {authMode === "signin" ? "Sign in" : "Sign up"}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: "center" }}>
              © Cơ sở tiêm vaccine {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={() => ({
          height: "100%",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: "50vw" },
          transition:
            "background-image var(--Transition-duration), left var(--Transition-duration) !important",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          backgroundColor: "background.level1",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            "url(https://res.cloudinary.com/dzxkl9am6/image/upload/v1742134250/Login_krzk4n.png)",
        })}
      />
    </CssVarsProvider>
  );
}