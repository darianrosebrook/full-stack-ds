import { useState } from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Field,
  Input,
  Switch,
  Button,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Tooltip,
} from "@full-stack-ds/react";

export function App() {
  const [displayName, setDisplayName] = useState("Ada Lovelace");
  const [email, setEmail] = useState("ada@example.com");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const deleteEnabled = confirmation === "DELETE";

  return (
    <Stack variant="vertical" as="main">
      <Card>
        <CardHeader>Profile</CardHeader>
        <CardContent>
          <Stack variant="vertical">
            <Field
              name="displayName"
              required
              slots={{
                label: "Display name",
                control: (
                  <Input
                    value={displayName}
                    onChange={setDisplayName}
                    required
                  />
                ),
              }}
            />
            <Field
              name="email"
              required
              slots={{
                label: "Email",
                control: (
                  <Input
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                  />
                ),
              }}
            />
          </Stack>
        </CardContent>
        <CardFooter>
          <Button
            variant="primary"
            onClick={() =>
              console.log("save profile", { displayName, email })
            }
          >
            Save profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>Preferences</CardHeader>
        <CardContent>
          <Stack variant="vertical">
            <Stack variant="horizontal">
              <span>Dark mode</span>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </Stack>
            <Stack variant="horizontal">
              <Tooltip>
                <Tooltip.Trigger>Email notifications</Tooltip.Trigger>
                <Tooltip.Content>
                  Product announcements and security alerts only.
                </Tooltip.Content>
              </Tooltip>
              <Switch
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Danger zone</CardHeader>
        <CardContent>
          Permanently delete your account. This cannot be undone.
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            Delete account
          </Button>
        </CardFooter>
      </Card>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        modal
        dismissible
      >
        <DialogHeader>
          <DialogTitle>Delete account?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack variant="vertical">
            <p>
              This will permanently remove your account. Type DELETE to
              confirm.
            </p>
            <Input
              name="confirmation"
              value={confirmation}
              onChange={setConfirmation}
            />
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirmation("");
              setConfirmOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!deleteEnabled}
            onClick={() => {
              console.log("delete account");
              setConfirmation("");
              setConfirmOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </Stack>
  );
}
