<script setup lang="ts">
import { computed, ref } from "vue";
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
  TooltipTrigger,
  TooltipContent,
} from "@full-stack-ds/vue";

const displayName = ref("Ada Lovelace");
const email = ref("ada@example.com");
const darkMode = ref(false);
const emailNotifications = ref(true);
const confirmOpen = ref(false);
const confirmation = ref("");

const deleteEnabled = computed(() => confirmation.value === "DELETE");

function saveProfile() {
  console.log("save profile", {
    displayName: displayName.value,
    email: email.value,
  });
}

function cancelDelete() {
  confirmation.value = "";
  confirmOpen.value = false;
}

function deleteAccount() {
  console.log("delete account");
  confirmation.value = "";
  confirmOpen.value = false;
}
</script>

<template>
  <Stack variant="vertical" as="main">
    <Card>
      <CardHeader>Profile</CardHeader>
      <CardContent>
        <Stack variant="vertical">
          <Field name="displayName" required>
            <template #label>Display name</template>
            <template #control>
              <Input
                :value="displayName"
                :onChange="(value) => (displayName = value)"
                required
              />
            </template>
          </Field>
          <Field name="email" required>
            <template #label>Email</template>
            <template #control>
              <Input
                type="email"
                :value="email"
                :onChange="(value) => (email = value)"
                required
              />
            </template>
          </Field>
        </Stack>
      </CardContent>
      <CardFooter>
        <Button variant="primary" :onClick="saveProfile">
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
            <Switch
              :checked="darkMode"
              :onChange="(checked) => (darkMode = checked)"
            />
          </Stack>
          <Stack variant="horizontal">
            <Tooltip>
              <TooltipTrigger>Email notifications</TooltipTrigger>
              <TooltipContent>
                Product announcements and security alerts only.
              </TooltipContent>
            </Tooltip>
            <Switch
              :checked="emailNotifications"
              :onChange="(checked) => (emailNotifications = checked)"
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
        <Button variant="destructive" :onClick="() => (confirmOpen = true)">
          Delete account
        </Button>
      </CardFooter>
    </Card>

    <Dialog
      :open="confirmOpen"
      :onOpenChange="(open) => (confirmOpen = open)"
      modal
      dismissible
    >
      <DialogHeader>
        <DialogTitle>Delete account?</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack variant="vertical">
          <p>
            This will permanently remove your account. Type DELETE to confirm.
          </p>
          <Input
            name="confirmation"
            :value="confirmation"
            :onChange="(value) => (confirmation = value)"
          />
        </Stack>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" :onClick="cancelDelete">
          Cancel
        </Button>
        <Button
          variant="destructive"
          :disabled="!deleteEnabled"
          :onClick="deleteAccount"
        >
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  </Stack>
</template>
