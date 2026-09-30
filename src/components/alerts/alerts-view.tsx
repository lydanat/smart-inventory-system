'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  generateTelegramLinkCodeAction,
  sendTestAlertAction,
  disconnectTelegramAction,
  toggleTelegramAlertsAction,
} from '@/actions/telegram';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Send,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Bell,
  BellOff,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Unlink,
  ShieldCheck,
} from 'lucide-react';

interface AlertEventRecord {
  id: number;
  kind: string;
  detail: string | null;
  status: string;
  dedupe_day: string;
  created_at: string;
}

interface AlertsViewProps {
  businessName: string;
  telegramChatId: string | null;
  telegramAlertsEnabled: boolean;
  recentEvents: AlertEventRecord[];
  botUsername: string;
}

export function AlertsView({
  businessName,
  telegramChatId,
  telegramAlertsEnabled,
  recentEvents,
  botUsername,
}: AlertsViewProps) {
  const router = useRouter();

  // Link code state
  const [linkData, setLinkData] = React.useState<{
    code: string;
    deepLink: string;
    expiresAt: string;
  } | null>(null);
  const [loadingCode, setLoadingCode] = React.useState(false);
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(0);

  // Actions loading
  const [sendingTest, setSendingTest] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);
  const [toggling, setToggling] = React.useState(false);
  const [alertsEnabled, setAlertsEnabled] = React.useState(telegramAlertsEnabled);

  // Countdown timer for 15-minute link code
  React.useEffect(() => {
    if (!linkData) return;

    const expiryTime = new Date(linkData.expiresAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
        setLinkData(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [linkData]);

  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      const res = await generateTelegramLinkCodeAction();
      if (!res.ok) {
        toast.error(res.error.message);
      } else {
        setLinkData(res.data);
        const expiry = new Date(res.data.expiresAt).getTime();
        setSecondsRemaining(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
        toast.success('Connection code generated!');
      }
    } finally {
      setLoadingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (linkData) {
      navigator.clipboard.writeText(linkData.code);
      toast.success(`Copied code "${linkData.code}" to clipboard!`);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const res = await sendTestAlertAction();
      if (!res.ok) {
        toast.error(res.error.message);
      } else {
        toast.success('Test message sent! Check your Telegram chat.');
        router.refresh();
      }
    } finally {
      setSendingTest(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Telegram alerts for this store?')) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await disconnectTelegramAction();
      if (!res.ok) {
        toast.error(res.error.message);
      } else {
        toast.success('Telegram disconnected.');
        router.refresh();
      }
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleAlerts = async (enabled: boolean) => {
    setToggling(true);
    setAlertsEnabled(enabled);
    try {
      const res = await toggleTelegramAlertsAction({ enabled });
      if (!res.ok) {
        setAlertsEnabled(!enabled); // rollback
        toast.error(res.error.message);
      } else {
        toast.success(enabled ? 'Telegram alerts enabled.' : 'Telegram alerts paused.');
      }
    } finally {
      setToggling(false);
    }
  };

  const isConnected = Boolean(telegramChatId);

  const getEventBadge = (kind: string) => {
    switch (kind) {
      case 'out_of_stock':
        return <Badge variant="destructive">Stockout</Badge>;
      case 'low_stock':
        return (
          <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">
            Low Stock
          </Badge>
        );
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'expiring_soon':
        return (
          <Badge variant="outline" className="border-orange-500/40 text-orange-600 bg-orange-500/10">
            Expiring Soon
          </Badge>
        );
      default:
        return <Badge variant="secondary">System Test</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Telegram Alerts & Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Connect your Telegram account to receive instant notifications when inventory runs low or items are nearing expiration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connection & Preferences (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Card */}
          <Card className="shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Telegram Bot Channel</CardTitle>
                    <CardDescription className="text-xs">
                      Official Bot: @{botUsername}
                    </CardDescription>
                  </div>
                </div>

                {isConnected ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 font-medium">
                    Not Linked
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isConnected ? (
                /* Connected State */
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Active Store:</span>
                      <span className="font-semibold text-foreground">{businessName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Telegram Chat ID:</span>
                      <span className="font-mono text-foreground font-semibold">{telegramChatId}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Alert Status:</span>
                      <span className={alertsEnabled ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                        {alertsEnabled ? 'Active & Receiving Alerts' : 'Notifications Paused'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      className="gap-1.5 font-medium"
                    >
                      {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 text-primary" />}
                      <span>Send Test Alert</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="text-destructive hover:text-destructive gap-1.5 ml-auto"
                    >
                      {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                      <span>Disconnect</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Not Connected State */
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Link your store to Telegram in under 30 seconds. Generate a one-time link code and send it to our bot to start receiving automated alerts.
                  </p>

                  {!linkData ? (
                    <Button
                      onClick={handleGenerateCode}
                      disabled={loadingCode}
                      className="gap-2 font-semibold"
                    >
                      {loadingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Connect Telegram</span>
                    </Button>
                  ) : (
                    /* Display generated code and deep link */
                    <div className="p-5 rounded-lg border border-primary/30 bg-primary/[0.02] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          One-Time Connection Code
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Expires in {Math.floor(secondsRemaining / 60)}:
                            {String(secondsRemaining % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-background border rounded-lg font-mono text-2xl font-bold tracking-widest text-foreground shadow-xs">
                          {linkData.code}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyCode}
                          title="Copy Code"
                          className="h-10 w-10"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="pt-2">
                        <Button asChild className="w-full gap-2 font-semibold">
                          <a href={linkData.deepLink} target="_blank" rel="noopener noreferrer">
                            <span>Open in Telegram (Auto-Link)</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center mt-2">
                          Clicking opens Telegram. Simply tap <b>START</b> and the bot will finish linking automatically.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Preferences Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">
                Configure which automated notifications are dispatched to your linked chat.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium text-foreground">Telegram Notifications Master Switch</p>
                  <p className="text-xs text-muted-foreground">
                    Enable or pause all automated alerts sent to Telegram.
                  </p>
                </div>
                <Switch
                  checked={alertsEnabled}
                  disabled={!isConnected || toggling}
                  onCheckedChange={handleToggleAlerts}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium text-foreground">Low Stock & Stockout Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Sent once daily per item whenever inventory drops to or below threshold.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Automatic (24h Cooldown)
                </Badge>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium text-foreground">Impending Expiration Notices</p>
                  <p className="text-xs text-muted-foreground">
                    Sent at 7 days, 3 days, 1 day, and on expiration date.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Automatic (Daily)
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bot Commands & Guide (1 col) */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Available Bot Commands</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Send these anytime directly in your Telegram chat:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-muted/40 border">
                <p className="font-mono font-semibold text-primary">/status</p>
                <p className="text-muted-foreground mt-0.5">
                  Instant summary of active SKUs, low stock count, and total store value.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border">
                <p className="font-mono font-semibold text-primary">/low</p>
                <p className="text-muted-foreground mt-0.5">
                  Lists all products currently requiring a restock with remaining quantities.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border">
                <p className="font-mono font-semibold text-primary">/stop</p>
                <p className="text-muted-foreground mt-0.5">
                  Unlinks your Telegram chat and immediately mutes all alerts.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border">
                <p className="font-mono font-semibold text-primary">/help</p>
                <p className="text-muted-foreground mt-0.5">
                  Shows all available commands and troubleshooting info.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Table: Recent Alert Events Log */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Alert Log</CardTitle>
            <CardDescription className="text-xs">
              Audit ledger of automated notifications dispatched to Telegram and other channels.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.refresh()} className="h-8 gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentEvents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm border-t">
              No alert notifications have been dispatched yet.
            </div>
          ) : (
            <div className="border-t overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Event Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Dispatched At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{getEventBadge(event.kind)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground text-sm">
                          {event.detail || 'Automated notification'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {event.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono">
                        {formatDateTime(event.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
