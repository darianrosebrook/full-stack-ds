import { useState } from "react";
import { Text } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Field,
  FsdsThemeProvider,
  Input,
  Progress,
  ShowMore,
  Stack,
  Switch,
} from "@full-stack-ds/react-native";

export function App() {
  const [displayName, setDisplayName] = useState("Ada Lovelace");
  const [email, setEmail] = useState("ada@example.com");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <FsdsThemeProvider value={{ density: "comfortable" }}>
      <Stack testID="settings-rn-root">
        <Card>
          <Stack>
            <Text>Profile</Text>
            <Field name="displayName" label="Display name" required>
              <Input value={displayName} onChange={setDisplayName} required />
            </Field>
            <Field name="email" label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
            </Field>
            <Button onPress={() => undefined}>Save profile</Button>
          </Stack>
        </Card>

        <Card>
          <Stack>
            <Text>Preferences</Text>
            <Stack variant="horizontal">
              <Text>Dark mode</Text>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </Stack>
            <Stack variant="horizontal">
              <Text>Email notifications</Text>
              <Switch
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </Stack>
            <Checkbox checked={marketing} onChange={setMarketing} />
          </Stack>
        </Card>

        <Card>
          <Stack>
            <Text>Storage</Text>
            <Progress value={64} label="Storage used" showValue>
              64%
            </Progress>
            <ShowMore
              expanded={expanded}
              onExpandedChange={setExpanded}
              maxLines={2}
            >
              Your workspace keeps local indexes, generated previews, and
              validation artifacts. Clear derived data when you need to reclaim
              space without deleting source files.
            </ShowMore>
          </Stack>
        </Card>
      </Stack>
    </FsdsThemeProvider>
  );
}
