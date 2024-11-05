"use client"
import React, { useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import insertAuditTrail from './insertAudit';
import { getUserID } from './getFromSession';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

interface IdleTimerWrapperProps {
  children: React.ReactNode;
  timeout: number; // in milliseconds
}

const IdleTimerWrapper: React.FC<IdleTimerWrapperProps> = ({ children, timeout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const token  = Cookies.get('token');

  const isLoginPage = pathname === '/login';

  const onIdle = () => {
    if (!isLoginPage) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Redirecting to login",
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 1500); // Wait for 1.5 seconds before redirecting

      insertAuditTrail({
        AppType: "Web",
        Activity: "Log Out",
        Action: `${getUserID()} Logged out`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: ""
      });

      Cookies.remove('token');
      Cookies.remove('login');
    }
  };

  const { reset } = useIdleTimer({
    timeout,
    onIdle,
    disabled: isLoginPage,
  });

  useEffect(() => {
    // Reset the timer when the pathname changes (except for the login page)
    if (!isLoginPage) {
      reset();
    }
  }, [pathname, reset, isLoginPage]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
          toast({
            variant: "destructive",
            title: "Token Expired",
            description: "Your authentication token has expired. Redirecting to login",
          });

          setTimeout(() => {
            router.push('/login');
          }, 1500); // Wait for 1.5 seconds before redirecting

          insertAuditTrail({
            AppType: "Web",
            Activity: "Log Out",
            Action: `${getUserID()} Logged out`,
            NewData: "",
            OldData: "",
            Remarks: "",
            UserId: getUserID(),
            PlantCode: ""
          });

          Cookies.remove('token');
          Cookies.remove('login');
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [token, router, toast]);

  return <>{children}</>;
};

export default IdleTimerWrapper;